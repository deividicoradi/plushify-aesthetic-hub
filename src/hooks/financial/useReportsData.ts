
import { useQuery } from '@tanstack/react-query';
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

      console.log('🔍 Buscando dados do relatório para o período:', { fromDate, toDate });

      // Buscar todos os pagamentos (incluindo pagos) para o período
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          payment_methods(name, type),
          clients(name)
        `)
        .eq('user_id', user?.id)
        .or('status.eq.pago,status.eq.parcial')
        .or(`payment_date.gte.${fromDate},created_at.gte.${fromDate}`)
        .or(`payment_date.lte.${toDate},created_at.lte.${toDate}`);

      console.log('💰 Pagamentos encontrados:', payments);
      if (paymentsError) {
        console.error('❌ Erro ao buscar pagamentos:', paymentsError);
      }

      // Buscar pagamentos excluídos através dos logs de auditoria
      const { data: deletedPayments, error: deletedError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('table_name', 'payments')
        .eq('action', 'DELETE')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      console.log('🗑️ Pagamentos excluídos encontrados:', deletedPayments);
      if (deletedError) {
        console.error('❌ Erro ao buscar pagamentos excluídos:', deletedError);
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

      // Buscar parcelamentos do período (pagos e pendentes)
      const { data: installments } = await supabase
        .from('installments')
        .select(`
          *,
          payments(description, payment_methods(name), clients(name))
        `)
        .eq('user_id', user?.id)
        .or(`payment_date.gte.${fromDate},due_date.gte.${fromDate}`)
        .or(`payment_date.lte.${toDate},due_date.lte.${toDate}`);

      console.log('📊 Parcelamentos encontrados:', installments?.length || 0);

      // Buscar despesas
      const { data: expenses } = await supabase
        .from('expenses')
        .select(`
          *,
          payment_methods(name, type)
        `)
        .eq('user_id', user?.id)
        .gte('expense_date', fromDate)
        .lte('expense_date', toDate);

      // Buscar fechamentos de caixa
      const { data: cashClosures, error: cashClosuresError } = await supabase
        .from('cash_closures')
        .select('*')
        .eq('user_id', user?.id)
        .gte('closure_date', fromDate)
        .lte('closure_date', toDate);

      console.log('🏦 Fechamentos de caixa encontrados:', cashClosures);
      if (cashClosuresError) {
        console.error('❌ Erro ao buscar fechamentos:', cashClosuresError);
      }

      // Fix TypeScript error by properly typing the payments
      const validPayments: Payment[] = (payments || []).map(p => ({
        id: p.id,
        description: p.description,
        amount: p.amount,
        paid_amount: p.paid_amount,
        status: p.status,
        created_at: p.created_at,
        payment_date: p.payment_date,
        clients: p.clients ? { name: p.clients.name } : undefined,
        payment_methods: p.payment_methods ? { 
          name: p.payment_methods.name, 
          type: p.payment_methods.type 
        } : undefined
      }));

      const allPayments: Payment[] = [
        ...validPayments,
        ...processedDeletedPayments
      ];

      return {
        payments: allPayments,
        installments: installments || [],
        expenses: expenses || [],
        cashClosures: cashClosures || [],
        period: { from: fromDate, to: toDate }
      };
    },
    enabled: !!user?.id,
  });
};
