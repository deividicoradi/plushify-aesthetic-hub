
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
      
      // Buscar pagamentos com métodos de pagamento
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          paid_amount,
          payment_methods (
            name,
            type
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pago');

      if (error) throw error;

      // Agrupar por método de pagamento
      const categoryMap = new Map<string, number>();
      let totalRevenue = 0;

      payments?.forEach(payment => {
        const amount = Number(payment.paid_amount);
        const categoryName = payment.payment_methods?.name || 'Outros';
        
        totalRevenue += amount;
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + amount);
      });

      // Converter para array com percentuais
      const categoriesData: CategoryData[] = Array.from(categoryMap.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: totalRevenue > 0 ? (value / totalRevenue) * 100 : 0
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

  return {
    revenueByCategory,
    loading,
    refetch: fetchRevenueByCategory
  };
};
