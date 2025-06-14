
import { useState, useEffect } from 'react';
import { usePaymentValidation } from './financial/usePaymentValidation';
import { useSecurePaymentMutation } from './financial/useSecurePaymentMutation';
import { usePaymentMutation } from './financial/usePaymentMutation';
import { useCashOpeningValidation } from './financial/useCashOpeningValidation';

interface PaymentFormData {
  description: string;
  amount: string;
  payment_method_id: string;
  client_id: string;
  due_date: string;
  notes: string;
  status: string;
  paid_amount: string;
  installments: string;
}

const initialFormData: PaymentFormData = {
  description: '',
  amount: '',
  payment_method_id: '',
  client_id: '',
  due_date: '',
  notes: '',
  status: 'pendente',
  paid_amount: '',
  installments: '1'
};

export const usePaymentForm = (payment?: any, onSuccess?: () => void) => {
  const [formData, setFormData] = useState<PaymentFormData>(initialFormData);
  const { validatePaymentForm, preparePaymentData } = usePaymentValidation();
  const { checkAndPromptCashOpening } = useCashOpeningValidation();
  
  // Para edições, usar a mutação segura
  const { updatePayment, isUpdating } = useSecurePaymentMutation(payment, onSuccess);
  
  // Para criações, usar a mutação normal
  const createMutation = usePaymentMutation(undefined, onSuccess);

  // Atualizar formData quando payment mudar
  useEffect(() => {
    if (payment) {
      console.log('📝 Carregando dados do pagamento para edição:', payment);
      setFormData({
        description: payment.description || '',
        amount: payment.amount?.toString() || '',
        payment_method_id: payment.payment_method_id || '',
        client_id: payment.client_id || '',
        due_date: payment.due_date ? payment.due_date.split('T')[0] : '',
        notes: payment.notes || '',
        status: payment.status || 'pendente',
        paid_amount: payment.paid_amount?.toString() || '',
        installments: payment.installments?.toString() || '1'
      });
    } else {
      // Reset para novo pagamento
      setFormData(initialFormData);
    }
  }, [payment]);

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Se marcar como pago e não tem paid_amount, usar o amount total
      if (field === 'status' && value === 'pago' && !newData.paid_amount) {
        newData.paid_amount = newData.amount;
      }
      
      // Se mudar o método de pagamento e não for cartão de crédito, resetar parcelas para 1
      if (field === 'payment_method_id') {
        // Reset installments when payment method changes
        newData.installments = '1';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePaymentForm(formData)) {
      return;
    }

    // Para novos pagamentos, verificar se o caixa está aberto
    if (!payment) {
      const validation = await checkAndPromptCashOpening(formData.due_date);
      if (!validation.shouldProceed) {
        return;
      }
    }

    // Para pagamentos parciais, validar se tem valor pago e se é menor que o total
    if (formData.status === 'parcial') {
      // Se não informou valor pago, mudar para pendente
      if (!formData.paid_amount || Number(formData.paid_amount) <= 0) {
        console.log('⚠️ Pagamento parcial sem valor pago - convertendo para pendente');
        setFormData(prev => ({ ...prev, status: 'pendente' }));
      }
    }

    const dataToSubmit = preparePaymentData(formData);
    console.log('Submetendo dados do pagamento:', dataToSubmit);
    
    if (payment) {
      // Para edições, usar a mutação segura (requer senha)
      updatePayment({ data: dataToSubmit, reason: 'Edição via formulário' });
    } else {
      // Para criações, usar a mutação normal (não precisa de senha)
      createMutation.mutate(dataToSubmit);
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    isLoading: payment ? isUpdating : createMutation.isPending
  };
};
