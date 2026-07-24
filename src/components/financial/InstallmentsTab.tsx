
import React, { useState } from 'react';
import InstallmentDialog from './InstallmentDialog';
import InstallmentsHeader from './installments/InstallmentsHeader';
import InstallmentsEmptyState from './installments/InstallmentsEmptyState';
import InstallmentsByClient from './installments/InstallmentsByClient';
import InstallmentsNoClient from './installments/InstallmentsNoClient';
import { useInstallmentsDataByClient } from '@/hooks/financial/useInstallmentsDataByClient';
import { useCashStatus } from './CashStatusProvider';
import { toast } from "@/hooks/use-toast";

const InstallmentsTab = () => {
  const { isOpen: isCashOpen } = useCashStatus();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<any>(null);

  const {
    clientGroups,
    installmentsWithoutClient,
    totalInstallments,
    isLoading,
    refetch
  } = useInstallmentsDataByClient();

  // Bloqueia ANTES de abrir o formulário (não só no submit) só pra parcelamento
  // NOVO — editar um parcelamento existente segue permitido (a regra de caixa
  // aberto se aplica à data do registro, não à de hoje).
  const handleOpenDialog = (installment?: any) => {
    if (!installment && !isCashOpen) {
      toast({
        title: "Caixa fechado",
        description: "Abra o caixa de hoje antes de criar um novo parcelamento.",
        variant: "destructive",
      });
      return;
    }
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
      <InstallmentsHeader onCreateNew={() => handleOpenDialog()} disabled={!isCashOpen} />

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">Carregando parcelamentos...</div>
        ) : totalInstallments === 0 ? (
          <InstallmentsEmptyState onCreateNew={() => handleOpenDialog()} />
        ) : (
          <>
            {/* Parcelamentos agrupados por cliente */}
            {clientGroups.map((clientData) => (
              <InstallmentsByClient
                key={clientData.id}
                clientData={clientData}
                onEdit={handleOpenDialog}
                onUpdate={refetch}
              />
            ))}

            {/* Parcelamentos sem cliente */}
            {installmentsWithoutClient.length > 0 && (
              <InstallmentsNoClient
                installments={installmentsWithoutClient}
                onEdit={handleOpenDialog}
                onUpdate={refetch}
              />
            )}
          </>
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
