
import { usePaymentUpdateMutation } from './usePaymentUpdateMutation';
import { usePaymentDeleteMutation } from './usePaymentDeleteMutation';

export const useSecurePaymentMutation = (payment?: any, onSuccess?: () => void) => {
  const { updatePayment, isUpdating } = usePaymentUpdateMutation(payment, onSuccess);
  const { deletePayment, isDeleting } = usePaymentDeleteMutation(payment, onSuccess);

  return {
    updatePayment,
    deletePayment,
    isUpdating,
    isDeleting
  };
};
