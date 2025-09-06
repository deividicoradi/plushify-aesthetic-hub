import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('active', true)
        .order('name');

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
  };

  const createProfessional = async (professionalData: Omit<Professional, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('professionals')
        .insert([{ ...professionalData, user_id: user.id }])
        .select()
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
  };

  const updateProfessional = async (id: string, updates: Partial<Professional>) => {
    try {
      const { data, error } = await supabase
        .from('professionals')
        .update(updates)
        .eq('id', id)
        .select()
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
  };

  const deleteProfessional = async (id: string) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ active: false })
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
  };

  const getProfessionalsByService = async (serviceId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .rpc('get_professionals_by_service', {
          p_user_id: user.id,
          p_service_id: serviceId
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching professionals by service:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

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