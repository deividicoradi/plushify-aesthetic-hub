import React, { useState, useMemo } from 'react';
import { Calendar, Loader2, CalendarDays, Check, X, Trash2, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AppointmentCard } from './AppointmentCard';
import { useAppointments } from '@/hooks/useAppointments';
import { format, isToday, isTomorrow, parseISO, isWithinInterval, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentFilters } from './AppointmentFiltersAdvanced';

interface AppointmentsListProps {
  searchQuery: string;
  filters?: AppointmentFilters;
}

export const AppointmentsList = ({ searchQuery, filters = {} }: AppointmentsListProps) => {
  const [activeTab, setActiveTab] = useState('hoje');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const { appointments, updateAppointment, deleteAppointment, isLoading } = useAppointments();

  console.log('AppointmentsList render - Total appointments:', appointments.length);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appointment => {
      // Search query filter
      const matchesSearch = !searchQuery || (
        appointment.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Status filter
      const matchesStatus = !statusFilter || appointment.status === statusFilter;

      // Date filter
      let matchesSelectedDate = true;
      if (selectedDate) {
        const appointmentDate = parseISO(appointment.appointment_date);
        const filterDate = parseISO(selectedDate);
        matchesSelectedDate = format(appointmentDate, 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd');
      }

      // Advanced filters
      const matchesAdvancedStatus = !filters.status || appointment.status === filters.status;
      const matchesClientName = !filters.clientName || 
        appointment.client_name.toLowerCase().includes(filters.clientName.toLowerCase());
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

      return matchesSearch && matchesStatus && matchesSelectedDate && 
             matchesAdvancedStatus && matchesClientName && 
             matchesServiceName && matchesDateRange && matchesTimeRange;
    });

    console.log('Filtered appointments:', filtered.length);
    return filtered;
  }, [appointments, searchQuery, statusFilter, selectedDate, filters]);

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

  const handleSelectAppointment = (appointmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAppointments(prev => [...prev, appointmentId]);
    } else {
      setSelectedAppointments(prev => prev.filter(id => id !== appointmentId));
    }
  };

  const handleSelectAll = (appointments: any[], checked: boolean) => {
    if (checked) {
      const appointmentIds = appointments.map(apt => apt.id);
      setSelectedAppointments(prev => [...new Set([...prev, ...appointmentIds])]);
    } else {
      const appointmentIds = appointments.map(apt => apt.id);
      setSelectedAppointments(prev => prev.filter(id => !appointmentIds.includes(id)));
    }
  };

  const handleBulkAction = async (action: 'confirmar' | 'cancelar' | 'concluir' | 'excluir') => {
    if (selectedAppointments.length === 0) {
      toast({
        title: "Nenhum agendamento selecionado",
        description: "Selecione pelo menos um agendamento para executar esta ação.",
        variant: "destructive"
      });
      return;
    }

    const selectedAppts = appointments.filter(apt => selectedAppointments.includes(apt.id));

    // Validações específicas
    for (const apt of selectedAppts) {
      if (action === 'cancelar') {
        const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
        const hoursUntilAppointment = differenceInHours(appointmentDateTime, new Date());
        
        if (hoursUntilAppointment < 24) {
          toast({
            title: "Cancelamento não permitido",
            description: `O agendamento de ${apt.client_name} só pode ser cancelado com até 24h de antecedência.`,
            variant: "destructive"
          });
          return;
        }
      }

      if (action === 'excluir') {
        if (apt.status === 'confirmado' || apt.status === 'concluido') {
          toast({
            title: "Exclusão não permitida",
            description: `Só é possível excluir agendamentos com status "aguardando confirmação" e "cancelados".`,
            variant: "destructive"
          });
          return;
        }
      }

      if (action === 'concluir') {
        if (apt.status !== 'confirmado') {
          toast({
            title: "Conclusão não permitida",
            description: `Só é possível concluir agendamentos com status "confirmado".`,
            variant: "destructive"
          });
          return;
        }
      }
    }

    try {
      if (action === 'excluir') {
        for (const appointmentId of selectedAppointments) {
          await deleteAppointment(appointmentId);
        }
        toast({
          title: "Agendamentos excluídos",
          description: `${selectedAppointments.length} agendamento(s) excluído(s) com sucesso.`
        });
      } else {
        const statusMap: Record<string, 'agendado' | 'confirmado' | 'concluido' | 'cancelado'> = {
          confirmar: 'confirmado',
          cancelar: 'cancelado',
          concluir: 'concluido'
        };
        
        for (const appointmentId of selectedAppointments) {
          await updateAppointment(appointmentId, { status: statusMap[action] });
        }
        
        toast({
          title: `Agendamentos ${action === 'confirmar' ? 'confirmados' : action === 'cancelar' ? 'cancelados' : 'concluídos'}`,
          description: `${selectedAppointments.length} agendamento(s) atualizado(s) com sucesso.`
        });
      }

      setSelectedAppointments([]);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a ação.",
        variant: "destructive"
      });
    }
  };

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

  const renderAppointmentsList = (appointmentsList: any[], tabKey: string) => (
    <div className="space-y-4">
      {/* Select All Checkbox */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Checkbox
          id={`select-all-${tabKey}`}
          checked={appointmentsList.every(apt => selectedAppointments.includes(apt.id))}
          onCheckedChange={(checked) => handleSelectAll(appointmentsList, checked as boolean)}
        />
        <Label htmlFor={`select-all-${tabKey}`} className="text-sm font-medium">
          Selecionar todos ({appointmentsList.length})
        </Label>
      </div>

      {/* Appointments Cards */}
      <div className="grid gap-4">
        {appointmentsList.map((appointment) => (
          <AppointmentCard 
            key={`${tabKey}-${appointment.id}`} 
            appointment={appointment}
            isSelected={selectedAppointments.includes(appointment.id)}
            onSelect={(checked) => handleSelectAppointment(appointment.id, checked)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Date Filter and Status Filter */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-gray-500" />
          <Label htmlFor="date-filter" className="text-sm font-medium">Data específica:</Label>
          <Input
            id="date-filter"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate('')}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os status</SelectItem>
              <SelectItem value="agendado">Agendando</SelectItem>
              <SelectItem value="confirmado">Confirmados</SelectItem>
              <SelectItem value="concluido">Concluídos</SelectItem>
              <SelectItem value="cancelado">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAppointments.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {selectedAppointments.length} agendamento(s) selecionado(s):
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('confirmar')}
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <Check className="w-4 h-4 mr-1" />
            Confirmar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('cancelar')}
            className="text-orange-600 border-orange-200 hover:bg-orange-50"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('concluir')}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Clock className="w-4 h-4 mr-1" />
            Concluir
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('excluir')}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Excluir
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hoje">Hoje ({todayAppointments.length})</TabsTrigger>
          <TabsTrigger value="amanha">Amanhã ({tomorrowAppointments.length})</TabsTrigger>
          <TabsTrigger value="todos">Todos ({filteredAppointments.length})</TabsTrigger>
          <TabsTrigger value="data">Por Data</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje" className="space-y-4 mt-6">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento para hoje</p>
            </div>
          ) : (
            renderAppointmentsList(todayAppointments, 'today')
          )}
        </TabsContent>

        <TabsContent value="amanha" className="space-y-4 mt-6">
          {tomorrowAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum agendamento para amanhã</p>
            </div>
          ) : (
            renderAppointmentsList(tomorrowAppointments, 'tomorrow')
          )}
        </TabsContent>

        <TabsContent value="todos" className="space-y-4 mt-6">
          {renderAppointmentsList(filteredAppointments, 'all')}
        </TabsContent>

        <TabsContent value="data" className="space-y-4 mt-6">
          {selectedDate ? (
            renderAppointmentsList(
              filteredAppointments.filter(apt => {
                const appointmentDate = parseISO(apt.appointment_date);
                const filterDate = parseISO(selectedDate);
                return format(appointmentDate, 'yyyy-MM-dd') === format(filterDate, 'yyyy-MM-dd');
              }),
              'date'
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Selecione uma data específica para ver os agendamentos</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};