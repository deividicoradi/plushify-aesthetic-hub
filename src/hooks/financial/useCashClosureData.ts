
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import * as cashApi from '@/api/cash';

export const useCashClosureData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cashClosures, isLoading: loadingClosures, refetch: refetchClosures } = useQuery({
    queryKey: ['cash-closures', user?.id],
    queryFn: () => cashApi.fetchCashClosures(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const { data: cashOpenings, isLoading: loadingOpenings, refetch: refetchOpenings } = useQuery({
    queryKey: ['cash-openings', user?.id],
    queryFn: () => cashApi.fetchCashOpenings(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const deleteClosureMutation = useMutation({
    mutationFn: (closureId: string) => cashApi.deleteCashClosure(user!.id, closureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-closures'] });
      toast({ title: 'Sucesso!', description: 'Fechamento excluído com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Erro ao excluir fechamento', variant: 'destructive' });
      console.error(error);
    },
  });

  const deleteOpeningMutation = useMutation({
    mutationFn: (openingId: string) => cashApi.deleteCashOpening(user!.id, openingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-openings'] });
      toast({ title: 'Sucesso!', description: 'Abertura excluída com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Erro ao excluir abertura', variant: 'destructive' });
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
