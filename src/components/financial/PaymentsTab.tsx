
import React, { useState } from 'react';
import PaymentDialog from './PaymentDialog';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import PaymentsHeader from './payments/PaymentsHeader';
import PaymentsList from './payments/PaymentsList';
import { usePaymentsData } from '@/hooks/financial/usePaymentsData';

const PaymentsTab = () => {
  const { payments, isLoading, deletePayment, getClientName } = usePaymentsData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setIsDialogOpen(true);
  };

  const handleDelete = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (paymentToDelete) {
      deletePayment(paymentToDelete);
      setPaymentToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPayment(null);
  };

  const filteredPayments = payments?.filter(payment =>
    payment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getClientName(payment.client_id)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PaymentsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewPayment={() => setIsDialogOpen(true)}
      />

      <PaymentsList
        payments={filteredPayments || []}
        isLoading={isLoading}
        getClientName={getClientName}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PaymentDialog 
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog}
        payment={editingPayment}
      />

      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Excluir Pagamento"
        description="Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
};

export default PaymentsTab;
