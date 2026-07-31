
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

// Ações administrativas/financeiras sensíveis agora são confirmadas com o
// código do app autenticador (TOTP) já usado pelo 2FA de login, em vez de uma
// segunda senha fixa: um código expira em 30s e não serve de novo se vazar,
// diferente de uma senha estática guardada no banco.
export const useAuthorizationPassword = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPassword = async (code: string): Promise<boolean> => {
    if (!user?.id) return false;

    setIsVerifying(true);
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const verifiedFactor = factorsData?.totp?.find((f) => f.status === 'verified');
      if (!verifiedFactor) {
        toast({
          title: "2FA Não Configurado",
          description: "Ative a autenticação em duas etapas nas configurações de segurança para autorizar esta ação.",
          variant: "destructive",
        });
        return false;
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id,
      });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challenge.id,
        code,
      });

      if (verifyError) {
        toast({
          title: "Código Inválido",
          description: "O código do autenticador está incorreto ou expirou.",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error: any) {
      console.error('Erro ao verificar código do autenticador:', error);
      toast({
        title: "Erro",
        description: error?.message || "Erro ao verificar código do autenticador.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    verifyPassword,
    isVerifying
  };
};
