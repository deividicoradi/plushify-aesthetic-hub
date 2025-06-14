
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('amount, category, type')
        .eq('user_id', user.id)
        .eq('type', 'receita');

      const categoryMap = new Map<string, number>();
      let totalRevenue = 0;

      transactions?.forEach(t => {
        const amount = Number(t.amount);
        totalRevenue += amount;
        
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + amount);
      });

      const categoryData: CategoryData[] = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
        percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0
      }));

      setRevenueByCategory(categoryData.sort((a, b) => b.value - a.value));
    } catch (err: any) {
      console.error('Erro ao buscar receita por categoria:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenueByCategory();
  }, [user]);

  return {
    revenueByCategory,
    loading,
    refetch: fetchRevenueByCategory
  };
};
