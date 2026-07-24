
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export const useCashOpeningValidation = () => {
  const { user } = useAuth();

  const checkAndPromptCashOpening = async (recordDate?: string): Promise<{ shouldProceed: boolean }> => {
    if (!user?.id) {
      return { shouldProceed: false };
    }

    // Usar a data atual (local, não UTC) se não for fornecida. new Date().toISOString()
    // usaria o dia UTC, que "vira" o dia seguinte a partir de ~21h no horário do Brasil.
    const targetDate = recordDate ? recordDate.split('T')[0] : format(new Date(), 'yyyy-MM-dd');
    
    console.log('🔍 [VALIDAÇÃO CRÍTICA] Verificando status do caixa para a data:', targetDate);

    // PRIMEIRO: Verificar se existe um caixa fechado para esta data
    const { data: closedCash, error: closureError } = await supabase
      .from('cash_closures')
      .select('id, closure_date, status')
      .eq('user_id', user.id)
      .eq('closure_date', targetDate)
      .eq('status', 'fechado');

    if (closureError) {
      console.error('❌ [ERRO CRÍTICO] Erro ao verificar fechamento do caixa:', closureError);
      toast({
        title: "Erro crítico",
        description: "Erro ao verificar status do caixa. Operação bloqueada por segurança.",
        variant: "destructive",
      });
      return { shouldProceed: false };
    }

    // Se encontrou qualquer caixa fechado para esta data, BLOQUEAR COMPLETAMENTE
    if (closedCash && closedCash.length > 0) {
      console.log('🚫 [BLOQUEIO TOTAL] Caixa está fechado para a data:', targetDate);
      const dateFormatted = new Date(targetDate + 'T00:00:00').toLocaleDateString('pt-BR');
      
      toast({
        title: "🚫 OPERAÇÃO BLOQUEADA",
        description: `O caixa do dia ${dateFormatted} está FECHADO. NENHUMA operação financeira é permitida para esta data. Abra o caixa primeiro!`,
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
      console.error('❌ [ERRO CRÍTICO] Erro ao verificar abertura do caixa:', openingError);
      toast({
        title: "Erro crítico",
        description: "Erro ao verificar status do caixa. Operação bloqueada por segurança.",
        variant: "destructive",
      });
      return { shouldProceed: false };
    }

    // Se não há caixa aberto, BLOQUEAR COMPLETAMENTE
    if (!openCash || openCash.length === 0) {
      console.log('🚫 [BLOQUEIO TOTAL] Não há caixa aberto para a data:', targetDate);
      const dateFormatted = new Date(targetDate + 'T00:00:00').toLocaleDateString('pt-BR');
      
      toast({
        title: "🚫 CAIXA FECHADO",
        description: `O caixa do dia ${dateFormatted} NÃO ESTÁ ABERTO. É obrigatório abrir o caixa antes de qualquer operação financeira!`,
        variant: "destructive",
      });
      
      return { shouldProceed: false };
    }

    console.log('✅ [LIBERADO] Caixa está aberto para a data:', targetDate);
    return { shouldProceed: true };
  };

  // Nova função para validar operações de hoje
  const validateTodayCashStatus = async (): Promise<{ shouldProceed: boolean }> => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return await checkAndPromptCashOpening(today);
  };

  return { checkAndPromptCashOpening, validateTodayCashStatus };
};
