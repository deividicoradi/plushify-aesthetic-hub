import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as dashboardApi from '@/api/dashboard';

interface DashboardData {
  stats: dashboardApi.DashboardStats;
  chartData: dashboardApi.ChartData[];
}

interface DateRange {
  startDate: Date;
  endDate: Date;
  period: string;
}

export const useOptimizedDashboardData = (dateRange: DateRange) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard-data', user?.id, dateRange.startDate, dateRange.endDate],
    queryFn: async (): Promise<DashboardData> => {
      if (!user) throw new Error('User not authenticated');

      const [stats, chartData] = await Promise.all([
        dashboardApi.fetchDashboardStats(user.id),
        dashboardApi.fetchChartData(user.id, dateRange.startDate, dateRange.endDate)
      ]);

      return {
        stats,
        chartData
      };
    },
    enabled: !!user?.id,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: 2,
  });
};