
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePaymentMethods = (enabled: boolean = true) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      console.log('Buscando métodos de pagamento para usuário:', user?.id);
      
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar métodos de pagamento:', error);
        throw error;
      }
      
      console.log('Métodos de pagamento encontrados:', data);
      
      // Se não há métodos, criar os padrão
      if (!data || data.length === 0) {
        console.log('Nenhum método encontrado, criando métodos padrão...');
        
        const defaultMethods = [
          { name: 'PIX', type: 'digital' },
          { name: 'Dinheiro', type: 'cash' },
          { name: 'Cartão de Débito', type: 'card' },
          { name: 'Cartão de Crédito', type: 'card' },
          { name: 'Transferência Bancária', type: 'transfer' },
          { name: 'Boleto', type: 'slip' },
          { name: 'Cheque', type: 'check' },
          { name: 'Vale Alimentação', type: 'voucher' },
          { name: 'Vale Refeição', type: 'voucher' },
          { name: 'Outros', type: 'other' }
        ];

        const { data: insertedData, error: insertError } = await supabase
          .from('payment_methods')
          .insert(
            defaultMethods.map(method => ({
              user_id: user?.id,
              name: method.name,
              type: method.type
            }))
          )
          .select();

        if (insertError) {
          console.error('Erro ao criar métodos padrão:', insertError);
          throw insertError;
        }

        console.log('Métodos padrão criados:', insertedData);
        return insertedData;
      }
      
      return data;
    },
    enabled: !!user?.id && enabled,
  });
};
