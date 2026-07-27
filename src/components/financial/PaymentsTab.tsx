
import React, { useMemo, useState } from 'react';
import PaymentDialog from './PaymentDialog';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import PaymentsHeader from './payments/PaymentsHeader';
import PaymentsList from './payments/PaymentsList';
import { usePaymentsData } from '@/hooks/financial/usePaymentsData';
import { useCashStatus } from './CashStatusProvider';
import { toast } from "@/hooks/use-toast";
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Button } from '@/components/ui/button';

const PaymentsTab = () => {
  const { payments, isLoading, getClientName, hasMore, loadMore } = usePaymentsData();
  const { isOpen: isCashOpen } = useCashStatus();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

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

  const filteredPayments = useMemo(() => payments?.filter(payment =>
    payment.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    getClientName(payment.client_id)?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  ), [payments, debouncedSearchTerm, getClientName]);

  return (
    <div className="space-y-6">
      <PaymentsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewPayment={handleNewPayment}
        disabled={!isCashOpen}
      />

      <PaymentsList
        payments={filteredPayments ?? []}
        isLoading={isLoading}
        getClientName={getClientName}
        onEdit={handleEdit}
        onDelete={() => {}} // Agora a exclusão é feita internamente no PaymentsList
      />

      {hasMore && !debouncedSearchTerm && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore}>Carregar mais</Button>
        </div>
      )}

      <PaymentDialog
        open={isDialogOpen} 
        onOpenChange={handleCloseDialog}
        payment={editingPayment}
      />
    </div>
  );
};

export default PaymentsTab;
