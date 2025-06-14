
import { toast } from "@/hooks/use-toast";

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

export const usePaymentValidation = () => {
  const validatePaymentForm = (formData: PaymentFormData): boolean => {
    if (!formData.description || !formData.amount || !formData.payment_method_id) {
      toast({
        title: "Erro",
        description: 'Preencha todos os campos obrigatórios',
        variant: "destructive",
      });
      return false;
    }

    // Se status é pago, deve ter paid_amount
    if (formData.status === 'pago' && (!formData.paid_amount || Number(formData.paid_amount) <= 0)) {
      toast({
        title: "Erro",
        description: 'Para pagamentos com status "pago", informe o valor pago',
        variant: "destructive",
      });
      return false;
    }

    // Para pagamentos parciais, validar se tem valor pago e se é menor que o total
    if (formData.status === 'parcial') {
      if (formData.paid_amount && Number(formData.paid_amount) > 0 && Number(formData.paid_amount) >= Number(formData.amount)) {
        toast({
          title: "Erro",
          description: 'Para pagamentos parciais, o valor pago deve ser menor que o valor total',
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const preparePaymentData = (formData: PaymentFormData) => {
    return {
      description: formData.description,
      amount: parseFloat(formData.amount),
      payment_method_id: formData.payment_method_id,
      client_id: formData.client_id || null,
      due_date: formData.due_date || null,
      notes: formData.notes || null,
      status: formData.status === 'parcial' && (!formData.paid_amount || Number(formData.paid_amount) <= 0) ? 'pendente' : formData.status,
      paid_amount: parseFloat(formData.paid_amount) || 0,
      payment_date: ['pago', 'parcial'].includes(formData.status) && Number(formData.paid_amount) > 0 ? new Date().toISOString() : null,
      installments: parseInt(formData.installments) || 1
    };
  };

  return {
    validatePaymentForm,
    preparePaymentData
  };
};
