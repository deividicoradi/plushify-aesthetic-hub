
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export const useCashOpeningValidation = () => {
  const { user } = useAuth();

  const checkAndPromptCashOpening = async (recordDate?: string): Promise<{ shouldProceed: boolean }> => {
    if (!user?.id) {
      return { shouldProceed: false };
    }

    // Usar a data atual se não for fornecida
    const targetDate = recordDate ? recordDate.split('T')[0] : new Date().toISOString().split('T')[0];
    
    console.log('🔍 Verificando status do caixa para a data:', targetDate);

    // PRIMEIRO: Verificar se existe um caixa fechado para esta data
    const { data: closedCash, error: closureError } = await supabase
      .from('cash_closures')
      .select('id, closure_date, status')
      .eq('user_id', user.id)
      .eq('closure_date', targetDate)
      .eq('status', 'fechado');

    if (closureError) {
      console.error('❌ Erro ao verificar fechamento do caixa:', closureError);
      toast({
        title: "Erro",
        description: "Erro ao verificar status do caixa",
        variant: "destructive",
      });
      return { shouldProceed: false };
    }

    // Se encontrou qualquer caixa fechado para esta data, bloquear operação
    if (closedCash && closedCash.length > 0) {
      console.log('❌ Caixa está fechado para a data:', targetDate, closedCash);
      const dateFormatted = new Date(targetDate + 'T00:00:00').toLocaleDateString('pt-BR');
      
      toast({
        title: "Caixa fechado",
        description: `O caixa do dia ${dateFormatted} está fechado. Não é possível criar novos registros para esta data.`,
        variant: "destructive",
      });
      
      return { shouldProceed: false };
    }

    // SEGUNDO: Se não há caixa fechado, verificar se existe um caixa aberto
    const { data: openCash, error: openingError } = await supabase
      .from('cash_openings')
      .select('id, opening_date, status')
      .eq('user_id', user.id)
      .eq('opening_date', targetDate)
      .eq('status', 'aberto');

    if (openingError) {
      console.error('❌ Erro ao verificar abertura do caixa:', openingError);
      toast({
        title: "Erro",
        description: "Erro ao verificar status do caixa",
        variant: "destructive",
      });
      return { shouldProceed: false };
    }

    // Se não há caixa aberto, também bloquear
    if (!openCash || openCash.length === 0) {
      console.log('❌ Não há caixa aberto para a data:', targetDate);
      const dateFormatted = new Date(targetDate + 'T00:00:00').toLocaleDateString('pt-BR');
      
      toast({
        title: "Caixa não está aberto",
        description: `O caixa do dia ${dateFormatted} não está aberto. Abra o caixa antes de registrar pagamentos ou parcelamentos.`,
        variant: "destructive",
      });
      
      return { shouldProceed: false };
    }

    console.log('✅ Caixa está aberto para a data:', targetDate);
    return { shouldProceed: true };
  };

  return { checkAndPromptCashOpening };
};
