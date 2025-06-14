
import { useCallback } from 'react';
import { useReportsMetrics, ReportsMetrics } from './reports/useReportsMetrics';
import { useMonthlyData, MonthlyData } from './reports/useMonthlyData';
import { useRevenueByCategory, CategoryData } from './reports/useRevenueByCategory';
import { useReportsRealtime } from './reports/useReportsRealtime';

export type { ReportsMetrics, MonthlyData, CategoryData };

export const useReportsData = () => {
  const metricsHook = useReportsMetrics();
  const monthlyDataHook = useMonthlyData();
  const categoryDataHook = useRevenueByCategory();

  const refetchAll = useCallback(async () => {
    await Promise.all([
      metricsHook.refetch(),
      monthlyDataHook.refetch(),
      categoryDataHook.refetch()
    ]);
  }, [metricsHook.refetch, monthlyDataHook.refetch, categoryDataHook.refetch]);

  // Set up real-time listeners
  useReportsRealtime({ onDataChange: refetchAll });

  // Combine loading states
  const isLoading = metricsHook.loading || monthlyDataHook.loading || categoryDataHook.loading;
  const hasError = metricsHook.error;

  return {
    metrics: metricsHook.metrics,
    monthlyData: monthlyDataHook.monthlyData,
    revenueByCategory: categoryDataHook.revenueByCategory,
    loading: isLoading,
    error: hasError,
    refetch: refetchAll
  };
};
