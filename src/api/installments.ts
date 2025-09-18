import { supabase } from '@/integrations/supabase/client';

export interface InstallmentInput {
  user_id: string | null | undefined;
  payment_id: string;
  installment_number: number;
  total_installments: number;
  amount: number;
  due_date: string;
  status: string;
  notes?: string;
}

export async function fetchInstallments(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('installments')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createInstallment(input: InstallmentInput) {
  const { data, error } = await supabase
    .from('installments')
    .insert([input])
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
