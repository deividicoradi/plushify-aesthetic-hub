import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// "Profissional" hoje é a mesma entidade de team_members (Gestão de Equipe) —
// professionals foi unificada em team_members para permitir comissão por
// profissional. Este hook mantém a interface pública antiga (Professional,
// create/update/delete/getProfessionalsByService) para não quebrar os
// componentes de agenda/serviços que já consomem ele.
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

export const useProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfessionals = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('id,user_id,name,email,phone,specialties,active,created_at,updated_at')
        .order('name', { ascending: true });

      if (error) throw error;
      setProfessionals(data || []);
    } catch (error) {
      console.error('Error fetching professionals:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar profissionais",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProfessional = useCallback(async (professionalData: Omit<Professional, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          ...professionalData,
          role: 'especialista',
          permissions: {},
          status: professionalData.active ? 'active' : 'inactive',
          user_id: user.id,
        }])
        .select('id,user_id,name,email,phone,specialties,active,created_at,updated_at')
        .single();

      if (error) throw error;

      setProfessionals(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Profissional criado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error creating professional:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar profissional",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const updateProfessional = useCallback(async (id: string, updates: Partial<Professional>) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(updates)
        .eq('id', id)
        .select('id,user_id,name,email,phone,specialties,active,created_at,updated_at')
        .single();

      if (error) throw error;

      setProfessionals(prev => prev.map(prof => prof.id === id ? data : prof));
      toast({
        title: "Sucesso",
        description: "Profissional atualizado com sucesso"
      });
      return data;
    } catch (error) {
      console.error('Error updating professional:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar profissional",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const deleteProfessional = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ active: false, status: 'inactive' })
        .eq('id', id);

      if (error) throw error;

      setProfessionals(prev => prev.filter(prof => prof.id !== id));
      toast({
        title: "Sucesso",
        description: "Profissional removido com sucesso"
      });
      return true;
    } catch (error) {
      console.error('Error deleting professional:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover profissional",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const getProfessionalsByService = useCallback(async (serviceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar relações service_professionals
      const { data: serviceProfessionals, error: spError } = await supabase
        .from('service_professionals')
        .select('professional_id')
        .eq('service_id', serviceId)
        .eq('user_id', user.id);

      if (spError) {
        console.error('Error fetching service professionals:', spError);
        // Se não há relação específica, retornar todos os profissionais ativos
        return professionals.filter(p => p.active);
      }

      if (!serviceProfessionals || serviceProfessionals.length === 0) {
        // Se não há profissionais específicos para o serviço, retornar todos os profissionais ativos
        return professionals.filter(p => p.active);
      }

      // Retornar apenas os profissionais vinculados ao serviço
      const professionalIds = serviceProfessionals.map(sp => sp.professional_id);
      return professionals.filter(p => professionalIds.includes(p.id) && p.active);
    } catch (error) {
      console.error('Error fetching professionals by service:', error);
      // Em caso de erro, retornar todos os profissionais ativos
      return professionals.filter(p => p.active);
    }
  }, [professionals]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  return {
    professionals,
    isLoading,
    fetchProfessionals,
    createProfessional,
    updateProfessional,
    deleteProfessional,
    getProfessionalsByService
  };
};
