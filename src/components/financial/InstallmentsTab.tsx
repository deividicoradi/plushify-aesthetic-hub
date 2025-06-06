
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const InstallmentsTab = () => {
  const { user } = useAuth();

  const { data: installments, isLoading } = useQuery({
    queryKey: ['installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select(`
          *
        `)
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar dados dos pagamentos separadamente
  const { data: payments } = useQuery({
    queryKey: ['payments-for-installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          description,
          amount,
          payment_methods (name)
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar clientes separadamente
  const { data: clients } = useQuery({
    queryKey: ['clients-for-installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'pendente';
    
    const statusConfig = {
      pendente: { 
        label: isOverdue ? 'Atrasado' : 'Pendente', 
        variant: isOverdue ? 'destructive' as const : 'secondary' as const 
      },
      pago: { label: 'Pago', variant: 'default' as const },
      atrasado: { label: 'Atrasado', variant: 'destructive' as const },
      cancelado: { label: 'Cancelado', variant: 'outline' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPaymentData = (paymentId: string) => {
    return payments?.find(p => p.id === paymentId);
  };

  const getClientName = (paymentId: string) => {
    const payment = payments?.find(p => p.id === paymentId);
    // Como não temos relação direta, retornamos null por enquanto
    return null;
  };

  const groupedInstallments = installments?.reduce((acc, installment) => {
    const paymentId = installment.payment_id;
    if (!acc[paymentId]) {
      const paymentData = getPaymentData(paymentId);
      acc[paymentId] = {
        payment: paymentData,
        installments: []
      };
    }
    acc[paymentId].installments.push(installment);
    return acc;
  }, {} as any);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Parcelamentos</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie parcelas e adiantamentos
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="text-center py-8">Carregando parcelamentos...</div>
        ) : !groupedInstallments || Object.keys(groupedInstallments).length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhum parcelamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          Object.values(groupedInstallments).map((group: any) => (
            <Card key={group.payment?.id || 'unknown'} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {group.payment?.description || 'Pagamento sem descrição'}
                    </CardTitle>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <p>Total: {group.payment ? formatCurrency(Number(group.payment.amount)) : 'N/A'}</p>
                      <p>Parcelas: {group.installments.length}x</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Método: {group.payment?.payment_methods?.name || 'N/A'}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y">
                  {group.installments.map((installment: any) => (
                    <div key={installment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                              {installment.installment_number}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                Parcela {installment.installment_number}/{installment.total_installments}
                              </span>
                              {getStatusBadge(installment.status, installment.due_date)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Vence: {format(new Date(installment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                              </span>
                              {installment.payment_date && (
                                <span className="text-green-600">
                                  Pago em: {format(new Date(installment.payment_date), 'dd/MM/yyyy', { locale: ptBR })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold">
                            {formatCurrency(Number(installment.amount))}
                          </div>
                          {Number(installment.paid_amount) > 0 && (
                            <div className="text-sm text-green-600">
                              Pago: {formatCurrency(Number(installment.paid_amount))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default InstallmentsTab;
