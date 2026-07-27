
import React, { useMemo, useState } from 'react';
import PaymentDialog from './PaymentDialog';
import PaymentsHeader from './payments/PaymentsHeader';
import PaymentsList from './payments/PaymentsList';
import { usePaymentsData } from '@/hooks/financial/usePaymentsData';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useCashGuardedDialog } from '@/hooks/financial/useCashGuardedDialog';
import { Button } from '@/components/ui/button';

const PaymentsTab = () => {
  const { payments, isLoading, getClientName, hasMore, loadMore } = usePaymentsData();
  const {
    isCashOpen,
    open: isDialogOpen,
    editing: editingPayment,
    openDialog,
    closeDialog: handleCloseDialog,
  } = useCashGuardedDialog<any>('Abra o caixa de hoje antes de criar um novo pagamento.');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const filteredPayments = useMemo(() => payments?.filter(payment =>
    payment.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    getClientName(payment.client_id)?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  ), [payments, debouncedSearchTerm, getClientName]);

  return (
    <div className="space-y-6">
      <PaymentsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewPayment={() => openDialog()}
        disabled={!isCashOpen}
      />

      <PaymentsList
        payments={filteredPayments ?? []}
        isLoading={isLoading}
        getClientName={getClientName}
        onEdit={(payment) => openDialog(payment)}
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
