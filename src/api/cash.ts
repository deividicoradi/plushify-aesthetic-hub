import { supabase } from '@/integrations/supabase/client';

export async function fetchCashClosures(userId: string) {
  const { data, error } = await supabase
    .from('cash_closures')
    .select('*')
    .eq('user_id', userId)
    .order('closure_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchCashOpenings(userId: string) {
  const { data, error } = await supabase
    .from('cash_openings')
    .select('*')
    .eq('user_id', userId)
    .order('opening_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function deleteCashClosure(userId: string, id: string) {
  const { error } = await supabase
    .from('cash_closures')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteCashOpening(userId: string, id: string) {
  const { error } = await supabase
    .from('cash_openings')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function fetchOpeningByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('cash_openings')
    .select('*')
    .eq('user_id', userId)
    .eq('opening_date', date)
    .maybeSingle();
  if (error) throw error;
  return data;
}
