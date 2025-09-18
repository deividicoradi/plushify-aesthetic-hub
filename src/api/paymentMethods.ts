import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export async function fetchPaymentMethods(userId: string): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .order('name');
  
  if (error) throw error;
  
  // Se não há métodos, criar os padrão
  if (!data || data.length === 0) {
    const defaultMethods = [
      { name: 'PIX', type: 'pix' },
      { name: 'Dinheiro', type: 'dinheiro' },
      { name: 'Cartão de Débito', type: 'cartao_debito' },
      { name: 'Cartão de Crédito', type: 'cartao_credito' },
      { name: 'Transferência Bancária', type: 'transferencia' },
      { name: 'Boleto', type: 'boleto' },
      { name: 'Cheque', type: 'cheque' },
      { name: 'Vale Alimentação', type: 'vale_alimentacao' },
      { name: 'Vale Refeição', type: 'vale_refeicao' },
      { name: 'Outros', type: 'outros' }
    ];

    const { data: insertedData, error: insertError } = await supabase
      .from('payment_methods')
      .insert(
        defaultMethods.map(method => ({
          user_id: userId,
          name: method.name,
          type: method.type,
          active: true
        }))
      )
      .select();

    if (insertError) throw insertError;
    return insertedData || [];
  }
  
  return data || [];
}