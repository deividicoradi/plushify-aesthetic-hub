
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import InstallmentDialog from './InstallmentDialog';
import InstallmentCard from './InstallmentCard';

const InstallmentsTab = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<any>(null);

  const { data: installments, isLoading, refetch } = useQuery({
    queryKey: ['installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('installments')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Buscar dados dos pagamentos
  const { data: payments } = useQuery({
    queryKey: ['payments-for-installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, description, amount, payment_methods(name)')
        .eq('user_id', user?.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const getPaymentData = (paymentId: string) => {
    return payments?.find(p => p.id === paymentId);
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

  const handleOpenDialog = (installment?: any) => {
    setEditingInstallment(installment || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingInstallment(null);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseDialog();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Parcelamentos</h2>
          <p className="text-muted-foreground">
            Gerencie parcelas e adiantamentos
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Parcelamento
        </Button>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">Carregando parcelamentos...</div>
        ) : !groupedInstallments || Object.keys(groupedInstallments).length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Nenhum parcelamento encontrado</h3>
                  <p className="text-muted-foreground">
                    Crie seu primeiro parcelamento para organizar pagamentos em parcelas.
                  </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Parcelamento
                </Button>
              </div>
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
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Parcelas: {group.installments.length}x</p>
                      <p>Método: {group.payment?.payment_methods?.name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.installments.map((installment: any) => (
                    <InstallmentCard
                      key={installment.id}
                      installment={installment}
                      paymentData={group.payment}
                      onEdit={handleOpenDialog}
                      onUpdate={refetch}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <InstallmentDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        onSuccess={handleSuccess}
        installment={editingInstallment}
      />
    </div>
  );
};

export default InstallmentsTab;
