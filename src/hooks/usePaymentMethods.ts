
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
              user_id: user?.id,
              name: method.name,
              type: method.type,
              active: true
            }))
          )
          .select();

        if (insertError) {
          console.error('Erro ao criar métodos padrão:', insertError);
          throw insertError;
        }

        console.log('Métodos padrão criados:', insertedData);
        return insertedData || [];
      }
      
      return data || [];
    },
    enabled: !!user?.id && enabled,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
