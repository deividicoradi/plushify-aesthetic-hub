
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
    
    console.log('🔍 Verificando se caixa está aberto para a data:', targetDate);

    // Verificar se existe um caixa aberto para esta data
    const { data: openCash, error } = await supabase
      .from('cash_openings')
      .select('id, opening_date, status')
      .eq('user_id', user.id)
      .eq('opening_date', targetDate)
      .eq('status', 'aberto')
      .maybeSingle();

    if (error) {
      console.error('❌ Erro ao verificar abertura do caixa:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar status do caixa",
        variant: "destructive",
      });
      return { shouldProceed: false };
    }

    // Se não há caixa aberto para esta data, mostrar mensagem
    if (!openCash) {
      const dateFormatted = new Date(targetDate + 'T00:00:00').toLocaleDateString('pt-BR');
      
      toast({
        title: "Caixa não está aberto",
        description: `O caixa do dia ${dateFormatted} não está aberto. Abra o caixa antes de registrar pagamentos ou parcelamentos.`,
        variant: "destructive",
      });
      
      console.log('❌ Caixa não está aberto para a data:', targetDate);
      return { shouldProceed: false };
    }

    console.log('✅ Caixa está aberto para a data:', targetDate);
    return { shouldProceed: true };
  };

  return { checkAndPromptCashOpening };
};
