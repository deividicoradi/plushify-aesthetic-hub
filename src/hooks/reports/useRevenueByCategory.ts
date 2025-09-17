
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as paymentsApi from '@/api/payments';

export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

export const useRevenueByCategory = () => {
  const { user } = useAuth();
  const [revenueByCategory, setRevenueByCategory] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevenueByCategory = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const payments = await paymentsApi.fetchPaidPaymentsWithMethods(user.id);

      const categoryMap = new Map<string, number>();
      let totalRevenue = 0;

      payments?.forEach((payment) => {
        const amount = Number(payment.paid_amount) || 0;
        const categoryName = payment.payment_methods?.name || 'Outros';
        totalRevenue += amount;
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
      });

      const categoriesData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0,
        }))
        .sort((a, b) => b.value - a.value);

      setRevenueByCategory(categoriesData);
    } catch (err: any) {
      console.error('Erro ao buscar receita por categoria:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueByCategory();
  }, [user]);

  return { revenueByCategory, loading, refetch: fetchRevenueByCategory };
};
