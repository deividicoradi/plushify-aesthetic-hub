
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export const useAuthorizationPassword = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!user?.email) return false;

    setIsVerifying(true);
    try {
      // Tentar fazer login com o email do usuário atual e a senha fornecida
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });
      
      if (error) {
        console.error('Erro na verificação da senha:', error);
        toast({
          title: "Senha Incorreta",
          description: "A senha de autorização está incorreta.",
          variant: "destructive",
        });
        return false;
      }

      // Se chegou até aqui, a senha está correta
      return true;
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      toast({
        title: "Erro",
        description: "Erro ao verificar senha de autorização.",
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
