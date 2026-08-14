
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Payment, Installment } from '@/utils/reports/types';

export const useReportsData = (dateFrom: Date, dateTo: Date, reportType: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['financial-report', user?.id, dateFrom, dateTo, reportType],
    queryFn: async () => {
      const fromDate = dateFrom.toISOString();
      const toDate = dateTo.toISOString();
      // closure_date é `date` (sem hora); comparar com timestamp ISO completo
      // pode vazar um dia a mais na borda do período dependendo do fuso.
      const fromDateOnly = format(dateFrom, 'yyyy-MM-dd');
      const toDateOnly = format(dateTo, 'yyyy-MM-dd');

      console.log('🔍 Buscando dados do relatório para o período:', { fromDate, toDate });

      // 1ª rodada: 5 consultas independentes entre si, em paralelo (antes
      // eram sequenciais, uma esperando a outra terminar sem necessidade —
      // só clients/payment_methods realmente dependem do resultado de
      // payments, então essas duas ficam pra 2ª rodada, também em paralelo).
      const [
        { data: payments, error: paymentsError },
        { data: deletedPayments, error: deletedError },
        { data: installments },
        { data: expenses },
        { data: cashClosures, error: cashClosuresError },
      ] = await Promise.all([
        supabase
          .from('payments')
          .select(`
            id,
            description,
            amount,
            paid_amount,
            status,
            created_at,
            payment_date,
            user_id,
            appointment_id,
            client_id,
            payment_method_id,
            discount,
            due_date,
            installments,
            notes
          `)
          .eq('user_id', user?.id)
          .or('status.eq.pago,status.eq.parcial')
          .or(`payment_date.gte.${fromDate},created_at.gte.${fromDate}`)
          .or(`payment_date.lte.${toDate},created_at.lte.${toDate}`),
        // Pagamentos excluídos através dos logs de auditoria
        supabase
          .from('audit_logs')
          .select('*')
          .eq('user_id', user?.id)
          .eq('table_name', 'payments')
          .eq('action', 'DELETE')
          .gte('created_at', fromDate)
          .lte('created_at', toDate),
        // Parcelamentos do período (pagos e pendentes)
        supabase
          .from('installments')
          .select(`
            id,
            installment_number,
            total_installments,
            amount,
            paid_amount,
            due_date,
            payment_date,
            status,
            payment_id
          `)
          .eq('user_id', user?.id)
          .or(`payment_date.gte.${fromDate},due_date.gte.${fromDate}`)
          .or(`payment_date.lte.${toDate},due_date.lte.${toDate}`),
        // Despesas
        supabase
          .from('expenses')
          .select(`
            *,
            payment_methods(name, type)
          `)
          .eq('user_id', user?.id)
          .gte('expense_date', fromDate)
          .lte('expense_date', toDate),
        // Fechamentos de caixa
        supabase
          .from('cash_closures')
          .select('*')
          .eq('user_id', user?.id)
          .gte('closure_date', fromDateOnly)
          .lte('closure_date', toDateOnly),
      ]);

      console.log('💰 Pagamentos encontrados:', payments);
      if (paymentsError) {
        console.error('❌ Erro ao buscar pagamentos:', paymentsError);
      }
      console.log('🗑️ Pagamentos excluídos encontrados:', deletedPayments);
      if (deletedError) {
        console.error('❌ Erro ao buscar pagamentos excluídos:', deletedError);
      }
      console.log('📊 Parcelamentos encontrados:', installments?.length || 0);
      console.log('🏦 Fechamentos de caixa encontrados:', cashClosures);
      if (cashClosuresError) {
        console.error('❌ Erro ao buscar fechamentos:', cashClosuresError);
      }

      // Processar pagamentos excluídos para incluir no relatório
      const processedDeletedPayments: Payment[] = deletedPayments?.map(log => {
        const oldData = log.old_data && typeof log.old_data === 'object' && log.old_data !== null ? log.old_data as any : {};
        return {
          id: oldData.id || log.record_id,
          description: oldData.description || 'Pagamento excluído',
          amount: Number(oldData.amount || 0),
          paid_amount: Number(oldData.paid_amount || 0),
          status: 'excluido',
          created_at: log.created_at,
          _deleted: true,
          _deleted_at: log.created_at,
          _deleted_reason: log.reason || 'Sem motivo informado'
        };
      }) || [];

      // 2ª rodada: nomes de cliente e método de pagamento pros IDs
      // encontrados em payments — precisam do resultado da 1ª rodada, mas
      // são independentes entre si, então rodam juntas.
      const clientIds = payments?.map(p => p.client_id).filter(Boolean) || [];
      const paymentMethodIds = payments?.map(p => p.payment_method_id).filter(Boolean) || [];

      const [clientsRes, paymentMethodsRes] = await Promise.all([
        clientIds.length > 0
          ? supabase.from('clients').select('id, name').in('id', clientIds)
          : Promise.resolve({ data: [], error: null }),
        paymentMethodIds.length > 0
          ? supabase.from('payment_methods').select('id, name, type').in('id', paymentMethodIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (clientsRes.error) {
        console.error('❌ Erro ao buscar clientes:', clientsRes.error);
      }
      if (paymentMethodsRes.error) {
        console.error('❌ Erro ao buscar métodos de pagamento:', paymentMethodsRes.error);
      }
      const clients = clientsRes.data || [];
      const paymentMethods = paymentMethodsRes.data || [];

      // Fix TypeScript error by properly typing the payments
      const validPayments: Payment[] = (payments || []).map(p => {
        const client = clients.find(c => c.id === p.client_id);
        const paymentMethod = paymentMethods.find(pm => pm.id === p.payment_method_id);
        
        return {
          id: p.id,
          description: p.description,
          amount: p.amount,
          paid_amount: p.paid_amount,
          status: p.status,
          created_at: p.created_at,
          payment_date: p.payment_date,
          clients: client ? { name: client.name } : undefined,
          payment_methods: paymentMethod ? { 
            name: paymentMethod.name, 
            type: paymentMethod.type 
          } : undefined
        };
      });

      // Process installments with payment information
      const processedInstallments = (installments || []).map(installment => {
        const relatedPayment = validPayments.find(p => p.id === installment.payment_id);
        return {
          ...installment,
          payments: relatedPayment ? {
            description: relatedPayment.description,
            payment_methods: relatedPayment.payment_methods
          } : undefined
        };
      });

      const allPayments: Payment[] = [
        ...validPayments,
        ...processedDeletedPayments
      ];

      return {
        payments: allPayments,
        installments: processedInstallments,
        expenses: expenses || [],
        cashClosures: cashClosures || [],
        period: { from: fromDate, to: toDate }
      };
    },
    enabled: !!user?.id,
  });
};
