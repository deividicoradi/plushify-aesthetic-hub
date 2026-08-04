import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

export type ProspectStatus = 'novo' | 'contatado' | 'interessado' | 'negociando' | 'convertido' | 'perdido';
export type ProspectOrigin = 'instagram' | 'facebook' | 'whatsapp' | 'indicacao' | 'google' | 'evento' | 'porta' | 'outro';
export type ContactChannel = 'whatsapp' | 'instagram' | 'telefone' | 'presencial' | 'email' | 'outro';

export type Prospect = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  origin: ProspectOrigin | null;
  contact_channel: ContactChannel | null;
  service_interest: string | null;
  estimated_value: number | null;
  status: ProspectStatus;
  loss_reason: string | null;
  next_action_note: string | null;
  next_action_date: string | null;
  last_contact_at: string | null;
  converted_client_id: string | null;
  converted_at: string | null;
  first_purchase_value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProspectInteraction = {
  id: string;
  prospect_id: string;
  channel: ContactChannel;
  note: string | null;
  occurred_at: string;
  created_at: string;
};

export type ProspectMetrics = {
  total_prospected: number;
  total_converted: number;
  total_lost: number;
  total_open: number;
  conversion_rate: number;
  loss_rate: number;
};

export type StaleProspect = {
  id: string;
  name: string;
  phone: string | null;
  status: ProspectStatus;
  last_contact_at: string | null;
  days_since_contact: number;
  urgency: 'atencao' | 'critico';
};

export const useProspects = () => {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProspects = useCallback(async (statusFilter?: ProspectStatus | 'todos') => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('prospects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'todos') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProspects((data || []) as Prospect[]);
    } catch (error: any) {
      console.error('Erro ao carregar prospects:', error);
      toast.error('Erro ao carregar prospects: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createProspect = async (input: Partial<Prospect> & { name: string }) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return null;
    }
    try {
      const { data, error } = await (supabase as any)
        .from('prospects')
        .insert([{ ...input, user_id: user.id }])
        .select('*')
        .single();
      if (error) throw error;
      setProspects(prev => [data as Prospect, ...prev]);
      toast.success('Prospect cadastrado com sucesso!');
      return data as Prospect;
    } catch (error: any) {
      console.error('Erro ao criar prospect:', error);
      toast.error('Erro ao criar prospect: ' + (error.message || 'Erro desconhecido'));
      return null;
    }
  };

  const updateProspect = async (id: string, updates: Partial<Prospect>) => {
    if (!user) return false;
    try {
      const { data, error } = await (supabase as any)
        .from('prospects')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();
      if (error) throw error;
      setProspects(prev => prev.map(p => (p.id === id ? (data as Prospect) : p)));
      toast.success('Prospect atualizado!');
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar prospect:', error);
      toast.error('Erro ao atualizar prospect: ' + (error.message || 'Erro desconhecido'));
      return false;
    }
  };

  const deleteProspect = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any)
        .from('prospects')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
      setProspects(prev => prev.filter(p => p.id !== id));
      toast.success('Prospect removido');
    } catch (error: any) {
      console.error('Erro ao remover prospect:', error);
      toast.error('Erro ao remover prospect: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const markLost = async (id: string, reason: string) => {
    return updateProspect(id, { status: 'perdido', loss_reason: reason });
  };

  const convertToClient = async (id: string, firstPurchaseValue?: number) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.rpc('convert_prospect_to_client' as any, {
        p_prospect_id: id,
        p_first_purchase_value: firstPurchaseValue ?? null,
      });
      if (error) throw error;
      await fetchProspects();
      toast.success('Prospect convertido em cliente!');
      return data as string;
    } catch (error: any) {
      console.error('Erro ao converter prospect:', error);
      toast.error('Erro ao converter: ' + (error.message || 'Erro desconhecido'));
      return null;
    }
  };

  const fetchInteractions = async (prospectId: string): Promise<ProspectInteraction[]> => {
    if (!user) return [];
    try {
      const { data, error } = await (supabase as any)
        .from('prospect_interactions')
        .select('*')
        .eq('prospect_id', prospectId)
        .eq('user_id', user.id)
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ProspectInteraction[];
    } catch (error: any) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico: ' + (error.message || 'Erro desconhecido'));
      return [];
    }
  };

  const addInteraction = async (prospectId: string, channel: ContactChannel, note: string) => {
    if (!user) return null;
    try {
      const { data, error } = await (supabase as any)
        .from('prospect_interactions')
        .insert([{ prospect_id: prospectId, user_id: user.id, channel, note }])
        .select('*')
        .single();
      if (error) throw error;
      toast.success('Contato registrado!');
      return data as ProspectInteraction;
    } catch (error: any) {
      console.error('Erro ao registrar contato:', error);
      toast.error('Erro ao registrar contato: ' + (error.message || 'Erro desconhecido'));
      return null;
    }
  };

  const fetchMetrics = async (startDate: string, endDate: string): Promise<ProspectMetrics | null> => {
    try {
      const { data, error } = await supabase.rpc('get_prospect_metrics' as any, {
        p_start_date: startDate,
        p_end_date: endDate,
      });
      if (error) throw error;
      return (data?.[0] ?? null) as ProspectMetrics | null;
    } catch (error: any) {
      console.error('Erro ao carregar métricas:', error);
      toast.error('Erro ao carregar métricas: ' + (error.message || 'Erro desconhecido'));
      return null;
    }
  };

  const fetchStaleProspects = async (): Promise<StaleProspect[]> => {
    try {
      const { data, error } = await supabase.rpc('get_stale_prospects' as any);
      if (error) throw error;
      return (data || []) as StaleProspect[];
    } catch (error: any) {
      console.error('Erro ao carregar prospects sem contato:', error);
      toast.error('Erro ao carregar prospects sem contato: ' + (error.message || 'Erro desconhecido'));
      return [];
    }
  };

  return {
    prospects,
    loading,
    fetchProspects,
    createProspect,
    updateProspect,
    deleteProspect,
    markLost,
    convertToClient,
    fetchInteractions,
    addInteraction,
    fetchMetrics,
    fetchStaleProspects,
  };
};
