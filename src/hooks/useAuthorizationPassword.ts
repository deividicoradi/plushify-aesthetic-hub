
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export const useAuthorizationPassword = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!user?.id) return false;

    setIsVerifying(true);
    try {
      // Use secure RPC function instead of re-authentication
      const { data, error } = await supabase.rpc('verify_authorization_password', {
        p_password: password
      });
      
      if (error) {
        console.error('Erro na verificação da senha:', error);
        
        // Check if password is not configured
        if (error.message?.includes('Authorization password not configured')) {
          toast({
            title: "Senha de Autorização Não Configurada",
            description: "Configure sua senha de autorização nas configurações de segurança.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Senha Incorreta",
            description: "A senha de autorização está incorreta.",
            variant: "destructive",
          });
        }
        return false;
      }

      // Return the verification result
      return data === true;
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

  const setPassword = async (password: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { data, error } = await supabase.rpc('set_authorization_password', {
        p_password: password
      });
      
      if (error) {
        console.error('Erro ao definir senha:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao definir senha de autorização.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Senha de autorização definida com sucesso.",
      });
      return true;
    } catch (error) {
      console.error('Erro ao definir senha:', error);
      toast({
        title: "Erro",
        description: "Erro ao definir senha de autorização.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    verifyPassword,
    setPassword,
    isVerifying
  };
};
