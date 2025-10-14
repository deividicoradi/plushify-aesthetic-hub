
import { useFinancialMetrics, FinancialMetrics } from './financial/useFinancialMetrics';
import { useMonthlyFinancialData, MonthlyFinancialData } from './financial/useMonthlyFinancialData';
import { useCategoryData, CategoryData } from './financial/useCategoryData';

export type { FinancialMetrics, MonthlyFinancialData, CategoryData };

interface DateRange {
  startDate: Date;
  endDate: Date;
  period: string;
}

export const useFinancialData = (dateRange: DateRange) => {
  const { 
    metrics, 
    loading: metricsLoading, 
    error, 
    refetch: refetchMetrics 
  } = useFinancialMetrics(dateRange);

  const { 
    monthlyData, 
    loading: monthlyLoading, 
    refetch: refetchMonthly 
  } = useMonthlyFinancialData(dateRange);

  const { 
    expensesByCategory, 
    revenueByMethod, 
    loading: categoryLoading, 
    refetch: refetchCategory 
  } = useCategoryData(dateRange);

  const loading = metricsLoading || monthlyLoading || categoryLoading;

  const refetch = () => {
    refetchMetrics();
    refetchMonthly();
    refetchCategory();
  };

  return {
    metrics,
    monthlyData,
    expensesByCategory,
    revenueByMethod,
    loading,
    error,
    refetch
  };
};
