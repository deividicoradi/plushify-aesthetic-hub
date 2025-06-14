
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

const DEFAULT_PASSWORD = "admin123"; // Senha padrão para desenvolvimento

export const useAuthorizationPassword = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPassword = async (password: string): Promise<boolean> => {
    if (!user?.id) return false;

    setIsVerifying(true);
    try {
      // Por simplicidade, vamos usar uma senha padrão para todos os usuários
      // Em produção, você pode implementar hash de senhas e armazenamento personalizado
      const isValid = password === DEFAULT_PASSWORD;
      
      if (!isValid) {
        toast({
          title: "Senha Incorreta",
          description: "A senha de autorização está incorreta.",
          variant: "destructive",
        });
      }

      return isValid;
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
