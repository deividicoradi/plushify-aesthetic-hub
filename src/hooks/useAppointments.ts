
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Appointment } from '@/types/appointment';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Converter dados do Supabase para o formato Appointment
      const formattedAppointments: Appointment[] = data.map(item => ({
        id: item.id,
        client: item.client_name || 'Cliente não informado',
        service: item.service || 'Serviço não informado',
        time: item.time || new Date(item.start_time).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        date: new Date(item.start_time),
        // Mapear status do banco para o formato da aplicação
        status: mapStatusFromDB(item.status)
      }));

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para mapear status da aplicação para o banco
  const mapStatusToDB = (status: "Confirmado" | "Pendente" | "Cancelado"): string => {
    const statusMap = {
      "Confirmado": "Confirmado",
      "Pendente": "Pendente", 
      "Cancelado": "Cancelado"
    };
    return statusMap[status] || "Pendente";
  };

  // Função para mapear status do banco para a aplicação
  const mapStatusFromDB = (status: string): "Confirmado" | "Pendente" | "Cancelado" => {
    const statusMap: { [key: string]: "Confirmado" | "Pendente" | "Cancelado" } = {
      "Confirmado": "Confirmado",
      "Pendente": "Pendente",
      "Cancelado": "Cancelado"
    };
    return statusMap[status] || "Pendente";
  };

  const createAppointment = async (appointmentData: Omit<Appointment, "id">) => {
    try {
      console.log('Criando agendamento com dados:', appointmentData);
      
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Combinar data e hora
      const [hours, minutes] = appointmentData.time.split(':');
      const startTime = new Date(appointmentData.date);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1); // Duração padrão de 1 hora

      // Mapear status para o formato do banco
      const dbStatus = mapStatusToDB(appointmentData.status);
      console.log('Status mapeado para DB:', dbStatus);

      const insertData = {
        user_id: user.id,
        title: `${appointmentData.service} - ${appointmentData.client}`,
        client_name: appointmentData.client,
        service: appointmentData.service,
        time: appointmentData.time,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: dbStatus,
        description: `Agendamento de ${appointmentData.service} para ${appointmentData.client}`
      };

      console.log('Dados para inserção no Supabase:', insertData);

      const { data, error } = await supabase
        .from('appointments')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Erro do Supabase:', error);
        throw error;
      }

      console.log('Agendamento criado com sucesso:', data);
      await fetchAppointments();
      
      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso."
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, appointmentData: Omit<Appointment, "id">) => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Combinar data e hora
      const [hours, minutes] = appointmentData.time.split(':');
      const startTime = new Date(appointmentData.date);
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      // Mapear status para o formato do banco
      const dbStatus = mapStatusToDB(appointmentData.status);

      const { error } = await supabase
        .from('appointments')
        .update({
          title: `${appointmentData.service} - ${appointmentData.client}`,
          client_name: appointmentData.client,
          service: appointmentData.service,
          time: appointmentData.time,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: dbStatus,
          description: `Agendamento de ${appointmentData.service} para ${appointmentData.client}`
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAppointments();
      
      toast({
        title: "Agendamento atualizado",
        description: "O agendamento foi atualizado com sucesso."
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      toast({
        title: "Erro ao atualizar agendamento",
        description: "Não foi possível atualizar o agendamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchAppointments();
      
      toast({
        title: "Agendamento excluído",
        description: "O agendamento foi excluído com sucesso."
      });
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      toast({
        title: "Erro ao excluir agendamento",
        description: "Não foi possível excluir o agendamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};
