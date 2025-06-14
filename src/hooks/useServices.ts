
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  category?: string;
  active: boolean;
}

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchServices = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('id, name, price, duration, description, category, active')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os serviços.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createService = async (serviceData: Omit<Service, 'id'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          ...serviceData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [...prev, data]);
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso!"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao criar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o serviço.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateService = async (id: string, updates: Partial<Service>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setServices(prev => 
        prev.map(service => 
          service.id === id ? data : service
        )
      );

      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso!"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao atualizar serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o serviço.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteService = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setServices(prev => prev.filter(service => service.id !== id));
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso!"
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao excluir serviço:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive"
      });
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
    isLoading,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    refetch: fetchServices
  };
};
