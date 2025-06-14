
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCashStatusValidation = () => {
  const { user } = useAuth();

  const validateCashIsOpen = async (recordDate: string): Promise<{ isValid: boolean; message?: string }> => {
    if (!user?.id) {
      return { isValid: false, message: 'Usuário não autenticado' };
    }

    // Extrair apenas a data (YYYY-MM-DD) do timestamp
    const recordDateOnly = recordDate.split('T')[0];
    
    console.log('🔍 Verificando status do caixa para a data:', recordDateOnly);

    // PRIMEIRO: Verificar se existe um caixa fechado para esta data
    const { data: closedCash, error: closureError } = await supabase
      .from('cash_closures')
      .select('id, closure_date, status')
      .eq('user_id', user.id)
      .eq('closure_date', recordDateOnly)
      .eq('status', 'fechado');

    if (closureError) {
      console.error('❌ Erro ao verificar fechamento do caixa:', closureError);
      return { isValid: false, message: 'Erro ao verificar status do caixa' };
    }

    // Se encontrou qualquer caixa fechado para esta data, bloquear operação
    if (closedCash && closedCash.length > 0) {
      console.log('❌ Caixa está fechado para a data:', recordDateOnly, closedCash);
      return { 
        isValid: false, 
        message: `O caixa do dia ${new Date(recordDateOnly + 'T00:00:00').toLocaleDateString('pt-BR')} está fechado. Não é possível editar ou excluir registros desta data.` 
      };
    }

    // SEGUNDO: Se não há caixa fechado, verificar se existe um caixa aberto
    const { data: openCash, error: openingError } = await supabase
      .from('cash_openings')
      .select('id, opening_date, status')
      .eq('user_id', user.id)
      .eq('opening_date', recordDateOnly)
      .eq('status', 'aberto');

    if (openingError) {
      console.error('❌ Erro ao verificar abertura do caixa:', openingError);
      return { isValid: false, message: 'Erro ao verificar status do caixa' };
    }

    // Se não há caixa aberto, também bloquear
    if (!openCash || openCash.length === 0) {
      console.log('❌ Não há caixa aberto para a data:', recordDateOnly);
      return { 
        isValid: false, 
        message: `Não há caixa aberto para o dia ${new Date(recordDateOnly + 'T00:00:00').toLocaleDateString('pt-BR')}. Abra o caixa desta data para poder editar ou excluir registros.` 
      };
    }

    console.log('✅ Caixa está aberto para a data:', recordDateOnly);
    return { isValid: true };
  };

  return { validateCashIsOpen };
};
