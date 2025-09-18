
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as dashboardApi from '@/api/dashboard';

export const useInteractiveChartData = () => {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['interactive-chart-data', user?.id],
    queryFn: () => dashboardApi.fetchChartData(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    data: data || [],
    loading: isLoading,
    refetch
  };
};
