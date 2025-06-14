
import React, { useState } from 'react';
import InstallmentDialog from './InstallmentDialog';
import InstallmentsHeader from './installments/InstallmentsHeader';
import InstallmentsEmptyState from './installments/InstallmentsEmptyState';
import InstallmentGroupCard from './installments/InstallmentGroupCard';
import { useInstallmentsData } from '@/hooks/financial/useInstallmentsData';

const InstallmentsTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<any>(null);

  const { groupedInstallments, isLoading, refetch } = useInstallmentsData();

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
        ) : !groupedInstallments || Object.keys(groupedInstallments).length === 0 ? (
          <InstallmentsEmptyState onCreateNew={() => handleOpenDialog()} />
        ) : (
          Object.values(groupedInstallments).map((group: any) => (
            <InstallmentGroupCard
              key={group.payment?.id || 'unknown'}
              group={group}
              onEdit={handleOpenDialog}
              onUpdate={refetch}
            />
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
