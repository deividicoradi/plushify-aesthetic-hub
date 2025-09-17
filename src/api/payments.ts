import { supabase } from '@/integrations/supabase/client';

export async function fetchPayments(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`*, payment_methods (name, type)`) 
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchPaidPaymentsWithMethods(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`paid_amount, payment_methods (name, type)`) 
    .eq('user_id', userId)
    .eq('status', 'pago');
  if (error) throw error;
  return data as { paid_amount: number; payment_methods: { name?: string; type?: string } | null }[];
}

export async function fetchPaymentsByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`*, payment_methods (name, type)`) 
    .eq('user_id', userId)
    .gte('created_at', `${date}T00:00:00`)
    .lt('created_at', `${date}T23:59:59`)
    .in('status', ['pago', 'parcial']);
  if (error) throw error;
  return data;
}

export async function deletePayment(userId: string, paymentId: string) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('user_id', userId);
  if (error) throw error;
}
