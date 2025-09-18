
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as dashboardApi from '@/api/dashboard';

export const useDashboardStats = () => {
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => dashboardApi.fetchDashboardStats(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  return {
    totalClients: data?.totalClients || 0,
    activeClients: data?.activeClients || 0,
    newThisMonth: data?.newThisMonth || 0,
    totalAppointments: data?.totalAppointments || 0,
    weeklyAppointments: data?.weeklyAppointments || 0,
    monthlyRevenue: data?.monthlyRevenue || 0,
    loading: isLoading,
    refetch
  };
};
