
import React, { useState, useMemo } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentCard } from './AppointmentCard';
import { useAppointments } from '@/hooks/useAppointments';
import { format, isToday, isTomorrow, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentFilters } from './AppointmentFiltersAdvanced';

interface AppointmentsListProps {
  searchQuery: string;
  filters?: AppointmentFilters;
}

export const AppointmentsList = ({ searchQuery, filters = {} }: AppointmentsListProps) => {
  const [activeTab, setActiveTab] = useState('hoje');
  const { appointments, isLoading } = useAppointments();

  console.log('AppointmentsList render - Total appointments:', appointments.length);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appointment => {
      // Search query filter
      const matchesSearch = !searchQuery || (
        appointment.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Status filter
      const matchesStatus = !filters.status || appointment.status === filters.status;

      // Client name filter
      const matchesClientName = !filters.clientName || 
        appointment.client_name.toLowerCase().includes(filters.clientName.toLowerCase());

      // Service name filter
      const matchesServiceName = !filters.serviceName || 
        appointment.service_name.toLowerCase().includes(filters.serviceName.toLowerCase());

      // Date range filter
      const appointmentDate = parseISO(appointment.appointment_date);
      let matchesDateRange = true;
      
      if (filters.dateFrom && filters.dateTo) {
        matchesDateRange = isWithinInterval(appointmentDate, {
          start: parseISO(filters.dateFrom),
          end: parseISO(filters.dateTo)
        });
      } else if (filters.dateFrom) {
        matchesDateRange = appointmentDate >= parseISO(filters.dateFrom);
      } else if (filters.dateTo) {
        matchesDateRange = appointmentDate <= parseISO(filters.dateTo);
      }

      // Time range filter
      let matchesTimeRange = true;
      if (filters.timeFrom || filters.timeTo) {
        const appointmentTime = appointment.appointment_time;
        if (filters.timeFrom) {
          matchesTimeRange = matchesTimeRange && appointmentTime >= filters.timeFrom;
        }
        if (filters.timeTo) {
          matchesTimeRange = matchesTimeRange && appointmentTime <= filters.timeTo;
        }
      }

      return matchesSearch && matchesStatus && matchesClientName && 
             matchesServiceName && matchesDateRange && matchesTimeRange;
    });

    console.log('Filtered appointments:', filtered.length);
    return filtered;
  }, [appointments, searchQuery, filters]);

  const todayAppointments = useMemo(() => {
    return filteredAppointments.filter(apt => {
      const appointmentDate = parseISO(apt.appointment_date);
      return isToday(appointmentDate);
    });
  }, [filteredAppointments]);

  const tomorrowAppointments = useMemo(() => {
    return filteredAppointments.filter(apt => {
      const appointmentDate = parseISO(apt.appointment_date);
      return isTomorrow(appointmentDate);
    });
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
                <AppointmentCard 
                  key={`today-${appointment.id}`} 
                  appointment={appointment} 
                />
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
                <AppointmentCard 
                  key={`tomorrow-${appointment.id}`} 
                  appointment={appointment} 
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos" className="space-y-4 mt-6">
          <div className="grid gap-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard 
                key={`all-${appointment.id}`} 
                appointment={appointment} 
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
