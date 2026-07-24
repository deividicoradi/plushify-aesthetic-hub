
import React, { useState } from 'react';
import PaymentDialog from './PaymentDialog';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import PaymentsHeader from './payments/PaymentsHeader';
import PaymentsList from './payments/PaymentsList';
import { usePaymentsData } from '@/hooks/financial/usePaymentsData';
import { useCashStatus } from './CashStatusProvider';
import { toast } from "@/hooks/use-toast";

const PaymentsTab = () => {
  const { payments, isLoading, getClientName } = usePaymentsData();
  const { isOpen: isCashOpen } = useCashStatus();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Bloqueia ANTES de abrir o formulário (não só no submit): sem isso o
  // usuário preenche tudo e só descobre que o caixa está fechado ao salvar,
  // perdendo o preenchimento à toa.
  const handleNewPayment = () => {
    if (!isCashOpen) {
      toast({
        title: "Caixa fechado",
        description: "Abra o caixa de hoje antes de criar um novo pagamento.",
        variant: "destructive",
      });
      return;
    }
    setIsDialogOpen(true);
  };

  const handleEdit = (payment: any) => {
    setEditingPayment(payment);
    setIsDialogOpen(true);
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
        onNewPayment={handleNewPayment}
        disabled={!isCashOpen}
      />

      <PaymentsList
        payments={filteredPayments || []}
        isLoading={isLoading}
        getClientName={getClientName}
        onEdit={handleEdit}
        onDelete={() => {}} // Agora a exclusão é feita internamente no PaymentsList
      />

      <PaymentDialog 
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog}
        payment={editingPayment}
      />
    </div>
  );
};

export default PaymentsTab;
