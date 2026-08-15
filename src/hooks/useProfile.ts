import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { validateImageFile } from '@/lib/imageUpload';

export interface Profile {
  name: string | null;
  phone: string | null;
  profession: string | null;
  avatar_url: string | null;
}

const sb: any = supabase;

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ name: null, phone: null, profession: null, avatar_url: null });
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
        .select('name, phone, profession, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({ name: data.name, phone: data.phone, profession: data.profession, avatar_url: data.avatar_url });
      } else {
        // Conta criada antes da tabela profiles existir (ou trigger falhou) — garante a linha agora.
        await sb.from('profiles').upsert({ id: user.id });
        setProfile({ name: null, phone: null, profession: null, avatar_url: null });
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

  const uploadAvatar = async (file: File): Promise<boolean> => {
    if (!user) return false;
    const validation = validateImageFile(file);
    if ('error' in validation) {
      toast({ title: 'Erro', description: validation.error, variant: 'destructive' });
      return false;
    }
    try {
      const path = `${user.id}/${crypto.randomUUID()}.${validation.extension}`;
      const { error: uploadError } = await supabase.storage
        .from('profile-avatars')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('profile-avatars').getPublicUrl(path);
      return await saveProfile({ avatar_url: data.publicUrl });
    } catch (error: any) {
      console.error('Erro ao enviar foto de perfil:', error);
      toast({ title: 'Erro', description: 'Não foi possível enviar a foto.', variant: 'destructive' });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, saveProfile, uploadAvatar, refetch: fetchProfile };
};
