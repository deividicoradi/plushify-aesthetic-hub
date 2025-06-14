
import { useFinancialMetrics, FinancialMetrics } from './financial/useFinancialMetrics';
import { useMonthlyFinancialData, MonthlyFinancialData } from './financial/useMonthlyFinancialData';
import { useCategoryData, CategoryData } from './financial/useCategoryData';

export type { FinancialMetrics, MonthlyFinancialData, CategoryData };

export const useFinancialData = () => {
  const { 
    metrics, 
    loading: metricsLoading, 
    error, 
    refetch: refetchMetrics 
  } = useFinancialMetrics();

  const { 
    monthlyData, 
    loading: monthlyLoading, 
    refetch: refetchMonthly 
  } = useMonthlyFinancialData();

  const { 
    expensesByCategory, 
    revenueByMethod, 
    loading: categoryLoading, 
    refetch: refetchCategory 
  } = useCategoryData();

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
