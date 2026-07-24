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
  // Limites do dia em horário local convertidos pra UTC antes de comparar com
  // created_at (timestamptz) — mandar "${date}T00:00:00" sem offset faz o Postgres
  // interpretar como UTC, perdendo/adicionando ~3h de pagamentos em fusos negativos.
  const startOfDayLocal = new Date(`${date}T00:00:00`).toISOString();
  const endOfDayLocal = new Date(`${date}T23:59:59.999`).toISOString();
  const { data, error } = await supabase
    .from('payments')
    .select(`*, payment_methods (name, type)`)
    .eq('user_id', userId)
    .gte('created_at', startOfDayLocal)
    .lte('created_at', endOfDayLocal)
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
