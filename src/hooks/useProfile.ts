import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Profile {
  name: string | null;
  phone: string | null;
  profession: string | null;
}

const sb: any = supabase;

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ name: null, phone: null, profession: null });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await sb
        .from('profiles')
        .select('name, phone, profession')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({ name: data.name, phone: data.phone, profession: data.profession });
      } else {
        // Conta criada antes da tabela profiles existir (ou trigger falhou) — garante a linha agora.
        await sb.from('profiles').upsert({ id: user.id });
        setProfile({ name: null, phone: null, profession: null });
      }
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar seu perfil.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (patch: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await sb.from('profiles').upsert({ id: user.id, ...patch });
      if (error) throw error;
      setProfile(prev => ({ ...prev, ...patch }));
      toast({ title: 'Perfil atualizado', description: 'Suas informações foram salvas com sucesso.' });
      return true;
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível salvar seu perfil.', variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, saveProfile, refetch: fetchProfile };
};
