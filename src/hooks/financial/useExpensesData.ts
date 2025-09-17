
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import * as expensesApi from '@/api/expenses';

export const useExpensesData = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: () => expensesApi.fetchExpenses(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (expenseId: string) => expensesApi.deleteExpense(user!.id, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({ title: 'Sucesso!', description: 'Despesa excluída com sucesso.' });
    },
    onError: (error) => {
      toast({ title: 'Erro', description: 'Erro ao excluir despesa', variant: 'destructive' });
      console.error(error);
    },
  });

  return {
    expenses,
    isLoading,
    deleteExpense: deleteExpenseMutation.mutate,
  };
};
