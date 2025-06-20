
import React, { useState } from 'react';
import InstallmentDialog from './InstallmentDialog';
import InstallmentsHeader from './installments/InstallmentsHeader';
import InstallmentsEmptyState from './installments/InstallmentsEmptyState';
import InstallmentsByClient from './installments/InstallmentsByClient';
import InstallmentsNoClient from './installments/InstallmentsNoClient';
import { useInstallmentsDataByClient } from '@/hooks/financial/useInstallmentsDataByClient';

const InstallmentsTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<any>(null);

  const { 
    clientGroups, 
    installmentsWithoutClient, 
    totalInstallments,
    isLoading, 
    refetch 
  } = useInstallmentsDataByClient();

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
      <InstallmentsHeader onCreateNew={() => handleOpenDialog()} />

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
