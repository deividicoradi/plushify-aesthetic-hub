
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

export const useExpensesData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          payment_methods (name, type)
        `)
        .eq('user_id', user?.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso!",
        description: "Despesa excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  return {
    expenses,
    isLoading,
    deleteExpense: deleteExpenseMutation.mutate
  };
};
