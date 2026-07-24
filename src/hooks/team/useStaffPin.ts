import { supabase } from '@/integrations/supabase/client';

const sb: any = supabase;

export const useStaffPin = () => {
  const setPin = async (memberId: string, pin: string): Promise<{ error: string | null }> => {
    const { error } = await sb.rpc('set_team_member_pin', { p_member_id: memberId, p_pin: pin });
    return { error: error?.message ?? null };
  };

  const clearPin = async (memberId: string): Promise<{ error: string | null }> => {
    const { error } = await sb.rpc('clear_team_member_pin', { p_member_id: memberId });
    return { error: error?.message ?? null };
  };

  const verifyPin = async (memberId: string, pin: string): Promise<boolean> => {
    const { data, error } = await sb.rpc('verify_team_member_pin', { p_member_id: memberId, p_pin: pin });
    if (error) return false;
    return !!data;
  };

  return { setPin, clearPin, verifyPin };
};
