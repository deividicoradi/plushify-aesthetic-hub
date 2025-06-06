
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

export interface Service {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  category?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchServices = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar serviços:', error);
      toast.error('Erro ao carregar serviços');
    } finally {
      setLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{
          ...serviceData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [data, ...prev]);
      toast.success('Serviço criado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao criar serviço:', error);
      toast.error('Erro ao criar serviço');
      return false;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setServices(prev => prev.map(service => 
        service.id === id ? data : service
      ));
      toast.success('Serviço atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      toast.error('Erro ao atualizar serviço');
      return false;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== id));
      toast.success('Serviço deletado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Erro ao deletar serviço:', error);
      toast.error('Erro ao deletar serviço');
      return false;
    }
  };

  const toggleServiceStatus = async (id: string, active: boolean) => {
    return await updateService(id, { active });
  };

  useEffect(() => {
    fetchServices();
  }, [user]);

  return {
    services,
    loading,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    refetch: fetchServices
  };
};
