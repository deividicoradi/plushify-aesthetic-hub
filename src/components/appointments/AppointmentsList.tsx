
import React, { useState, useMemo } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentCard } from './AppointmentCard';
import { useAppointments } from '@/hooks/useAppointments';
import { format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentsListProps {
  searchQuery: string;
}

export const AppointmentsList = ({ searchQuery }: AppointmentsListProps) => {
  const [activeTab, setActiveTab] = useState('hoje');
  const { appointments, isLoading } = useAppointments();

  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment =>
      appointment.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  const todayAppointments = useMemo(() => {
    return filteredAppointments.filter(apt => isToday(new Date(apt.appointment_date)));
  }, [filteredAppointments]);

  const tomorrowAppointments = useMemo(() => {
    return filteredAppointments.filter(apt => isTomorrow(new Date(apt.appointment_date)));
  }, [filteredAppointments]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-plush-600" />
      </div>
    );
  }

  if (filteredAppointments.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {searchQuery ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery 
            ? 'Tente buscar com outros termos ou limpe os filtros'
            : 'Comece criando seu primeiro agendamento'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hoje">Hoje ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="amanha">Amanhã ({tomorrowAppointments.length})</TabsTrigger>
          <TabsTrigger value="todos">Todos ({filteredAppointments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje" className="space-y-4 mt-6">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {todayAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="amanha" className="space-y-4 mt-6">
          {tomorrowAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento para amanhã</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tomorrowAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
