
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export const useCashClosureData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cashClosures, isLoading: loadingClosures, refetch: refetchClosures } = useQuery({
    queryKey: ['cash-closures', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_closures')
        .select('*')
        .eq('user_id', user?.id)
        .order('closure_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: cashOpenings, isLoading: loadingOpenings, refetch: refetchOpenings } = useQuery({
    queryKey: ['cash-openings', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_openings')
        .select('*')
        .eq('user_id', user?.id)
        .order('opening_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const deleteClosureMutation = useMutation({
    mutationFn: async (closureId: string) => {
      const { error } = await supabase
        .from('cash_closures')
        .delete()
        .eq('id', closureId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-closures'] });
      toast({
        title: "Sucesso!",
        description: "Fechamento excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir fechamento",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const deleteOpeningMutation = useMutation({
    mutationFn: async (openingId: string) => {
      const { error } = await supabase
        .from('cash_openings')
        .delete()
        .eq('id', openingId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-openings'] });
      toast({
        title: "Sucesso!",
        description: "Abertura excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir abertura",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleRefetch = () => {
    refetchClosures();
    refetchOpenings();
  };

  return {
    cashClosures,
    cashOpenings,
    loadingClosures,
    loadingOpenings,
    handleRefetch,
    deleteClosure: deleteClosureMutation.mutate,
    deleteOpening: deleteOpeningMutation.mutate,
  };
};
