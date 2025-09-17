import { supabase } from '@/integrations/supabase/client';

export async function fetchExpenses(userId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`*, payment_methods (name, type)`) 
    .eq('user_id', userId)
    .order('expense_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteExpense(userId: string, expenseId: string) {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId);
  if (error) throw error;
}
