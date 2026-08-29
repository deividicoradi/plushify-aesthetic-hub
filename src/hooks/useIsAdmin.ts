import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// has_role só retorna true/false (nunca dados) — seguro de chamar direto do
// cliente. A proteção de verdade dos dados fica nas RPCs/RLS que checam
// has_role de novo no servidor; este hook só decide o que renderizar na tela.
export const useIsAdmin = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.rpc('has_role_self', {
        _role: 'admin',
      });
      if (error) {
        console.error('Erro ao verificar papel de admin:', error);
        return false;
      }
      return !!data;
    },
  });

  return { isAdmin: !!data, loading: !!user && isLoading };
};
