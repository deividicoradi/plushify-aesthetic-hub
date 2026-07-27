
import React from 'react';
import InstallmentDialog from './InstallmentDialog';
import InstallmentsHeader from './installments/InstallmentsHeader';
import InstallmentsEmptyState from './installments/InstallmentsEmptyState';
import InstallmentsByClient from './installments/InstallmentsByClient';
import InstallmentsNoClient from './installments/InstallmentsNoClient';
import { useInstallmentsDataByClient } from '@/hooks/financial/useInstallmentsDataByClient';
import { useCashGuardedDialog } from '@/hooks/financial/useCashGuardedDialog';

const InstallmentsTab = () => {
  const {
    isCashOpen,
    open: dialogOpen,
    editing: editingInstallment,
    openDialog: handleOpenDialog,
    closeDialog: handleCloseDialog,
  } = useCashGuardedDialog<any>('Abra o caixa de hoje antes de criar um novo parcelamento.');

  const {
    clientGroups,
    installmentsWithoutClient,
    totalInstallments,
    isLoading,
    refetch
  } = useInstallmentsDataByClient();

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
