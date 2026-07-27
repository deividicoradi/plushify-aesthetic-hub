import { useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeamMembers } from '@/hooks/useTeamMembers';

// "Profissional" hoje é a mesma entidade de team_members (Gestão de Equipe) —
// professionals foi unificada em team_members para permitir comissão por
// profissional. Este hook antes reimplementava fetch/create/update/delete
// manualmente contra a tabela, em paralelo ao cache React Query que
// useTeamMembers já mantém pra essa mesma tabela — dois caminhos de código
// independentes sobre os mesmos dados, sem cache compartilhado. Agora é só
// uma projeção de useTeamMembers, então editar um membro em qualquer tela
// invalida o mesmo cache e reflete em todo lugar imediatamente.
export interface Professional {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

const toProfessional = (m: {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  active?: boolean;
  created_at: string;
  updated_at: string;
}): Professional => ({
  id: m.id,
  user_id: m.user_id,
  name: m.name,
  email: m.email,
  phone: m.phone,
  specialties: m.specialties,
  active: m.active ?? true,
  created_at: m.created_at,
  updated_at: m.updated_at,
});

export const useProfessionals = () => {
  const { teamMembers, loading, refetch, createTeamMember, updateTeamMember } = useTeamMembers();

  const professionals = useMemo(
    () => teamMembers.map(toProfessional).sort((a, b) => a.name.localeCompare(b.name)),
    [teamMembers]
  );

  const createProfessional = useCallback(async (
    professionalData: Omit<Professional, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    const created = await createTeamMember({
      name: professionalData.name,
      email: professionalData.email,
      phone: professionalData.phone,
      specialties: professionalData.specialties,
      active: professionalData.active,
      role: 'especialista',
      status: professionalData.active ? 'active' : 'inactive',
    });
    return toProfessional(created);
  }, [createTeamMember]);

  const updateProfessional = useCallback(async (id: string, updates: Partial<Professional>) => {
    const updated = await updateTeamMember(id, updates);
    return toProfessional(updated);
  }, [updateTeamMember]);

  const deleteProfessional = useCallback(async (id: string) => {
    await updateTeamMember(id, { active: false, status: 'inactive' });
    return true;
  }, [updateTeamMember]);

  const getProfessionalsByService = useCallback(async (serviceId: string) => {
    const activeProfessionals = professionals.filter(p => p.active);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: serviceProfessionals, error } = await supabase
        .from('service_professionals')
        .select('professional_id')
        .eq('service_id', serviceId)
        .eq('user_id', user.id);

      if (error || !serviceProfessionals || serviceProfessionals.length === 0) {
        return activeProfessionals;
      }

      const professionalIds = serviceProfessionals.map(sp => sp.professional_id);
      return activeProfessionals.filter(p => professionalIds.includes(p.id));
    } catch (error) {
      console.error('Error fetching professionals by service:', error);
      return activeProfessionals;
    }
  }, [professionals]);

  return {
    professionals,
    isLoading: loading,
    fetchProfessionals: refetch,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    getProfessionalsByService,
  };
};
