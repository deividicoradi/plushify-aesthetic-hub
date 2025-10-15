import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Loader2, CalendarDays, Check, X, Trash2, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AppointmentCard } from './AppointmentCard';
import { AppointmentsEmptyState } from './AppointmentsEmptyState';
import { useAppointments } from '@/hooks/useAppointments';
import { format, isToday, isTomorrow, parseISO, isWithinInterval, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppointmentFilters } from './AppointmentFiltersAdvanced';

interface AppointmentsListProps {
  searchQuery: string;
  filters?: AppointmentFilters;
  onCreateNew?: () => void;
  onClearFilters?: () => void;
}

export const AppointmentsList = ({ searchQuery, filters = {}, onCreateNew, onClearFilters }: AppointmentsListProps) => {
  const [activeTab, setActiveTab] = useState('hoje');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const { appointments, updateAppointment, deleteAppointment, isLoading } = useAppointments();

  // Local buffered states to avoid applying filters while typing/selecting
  const [dateInput, setDateInput] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => { setDateInput(selectedDate); }, [selectedDate]);
  useEffect(() => { setStatusInput(statusFilter); }, [statusFilter]);

  console.log('AppointmentsList render - Total appointments:', appointments.length);

  const filteredAppointments = useMemo(() => {
    let filtered = appointments.filter(appointment => {
      // Search query filter
      const matchesSearch = !searchQuery || (
        appointment.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.service_name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Status filter
      const matchesStatus = !statusFilter || statusFilter === 'all' || appointment.status === statusFilter;

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
        const deletePromises = selectedAppointments.map(appointmentId => 
          deleteAppointment(appointmentId)
        );
        await Promise.all(deletePromises);
        
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
        
        const updatePromises = selectedAppointments.map(appointmentId => 
          updateAppointment(appointmentId, { status: statusMap[action] })
        );
        await Promise.all(updatePromises);
        
        toast({
          title: `Agendamentos ${action === 'confirmar' ? 'confirmados' : action === 'cancelar' ? 'cancelados' : 'concluídos'}`,
          description: `${selectedAppointments.length} agendamento(s) atualizado(s) com sucesso.`
        });
      }

      setSelectedAppointments([]);
    } catch (error: any) {
      console.error('Erro ao processar ação em massa:', error);
      const msg = error?.message || error?.error?.message || error?.data?.message || 'Ocorreu um erro ao processar a ação.';
      toast({
        title: "Erro",
        description: msg,
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

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

  if (filteredAppointments.length === 0) {
    return (
      <AppointmentsEmptyState
        searchQuery={searchQuery}
        hasFilters={hasActiveFilters}
        onCreateNew={onCreateNew}
        onClearFilters={onClearFilters}
      />
    );
  }

  const renderAppointmentsList = (appointmentsList: any[], tabKey: string) => (
    <div className="space-y-4">
      {/* Select All Checkbox - More elegant */}
      {appointmentsList.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <Checkbox
            id={`select-all-${tabKey}`}
            checked={appointmentsList.every(apt => selectedAppointments.includes(apt.id))}
            onCheckedChange={(checked) => handleSelectAll(appointmentsList, checked as boolean)}
            className="border-gray-400"
          />
          <Label htmlFor={`select-all-${tabKey}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Selecionar todos
          </Label>
          <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-md text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            {appointmentsList.length} item{appointmentsList.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Appointments Cards */}
      <div className="grid gap-3">
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
    <div className="space-y-4">
      {/* Quick Filters Bar - Simplified */}
      {(selectedDate || statusFilter) && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          {selectedDate && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <CalendarDays className="w-3 h-3 text-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedDate('')}
                className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
          
          {statusFilter && statusFilter !== 'all' && (
            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {statusFilter === 'agendado' ? 'Agendado' : 
                 statusFilter === 'confirmado' ? 'Confirmado' : 
                 statusFilter === 'concluido' ? 'Concluído' : 'Cancelado'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatusFilter('')}
                className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Compact Filter Controls - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          onBlur={() => setSelectedDate(dateInput)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSelectedDate(dateInput); } }}
          className="w-full sm:w-auto h-11 sm:h-10 text-sm touch-target pointer-events-auto"
          placeholder="Data"
        />

        <Select 
          value={statusInput} 
          onValueChange={setStatusInput}
          open={statusOpen}
          onOpenChange={(o) => {
            setStatusOpen(o);
            if (!o) {
              setStatusFilter(statusInput || '');
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-40 h-11 sm:h-10 touch-target">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="z-50 bg-background">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="agendado">Agendado</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions - Mobile Optimized */}
      {selectedAppointments.length > 0 && (
        <div className="sticky top-4 z-10 flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-lg border border-blue-200 dark:border-blue-800 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedAppointments.length} selecionado{selectedAppointments.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('confirmar')}
              className="h-11 sm:h-9 text-green-700 border-green-300 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:border-green-700 dark:bg-green-950/50 dark:hover:bg-green-950/70 transition-all touch-target"
            >
              <Check className="w-4 h-4 sm:w-3 sm:h-3 sm:mr-1" />
              <span className="hidden sm:inline">Confirmar</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('cancelar')}
              className="h-11 sm:h-9 text-amber-700 border-amber-300 bg-amber-50 hover:bg-amber-100 dark:text-amber-400 dark:border-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-950/70 transition-all touch-target"
            >
              <X className="w-4 h-4 sm:w-3 sm:h-3 sm:mr-1" />
              <span className="hidden sm:inline">Cancelar</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('concluir')}
              className="h-11 sm:h-9 text-blue-700 border-blue-300 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:border-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-950/70 transition-all touch-target"
            >
              <Clock className="w-4 h-4 sm:w-3 sm:h-3 sm:mr-1" />
              <span className="hidden sm:inline">Concluir</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkAction('excluir')}
              className="h-11 sm:h-9 text-red-700 border-red-300 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:border-red-700 dark:bg-red-950/50 dark:hover:bg-red-950/70 transition-all touch-target"
            >
              <Trash2 className="w-4 h-4 sm:w-3 sm:h-3 sm:mr-1" />
              <span className="hidden sm:inline">Excluir</span>
            </Button>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto sm:h-10 p-1">
          <TabsTrigger value="hoje" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-2 touch-target">
            <span className="hidden sm:inline">Hoje ({todayAppointments.length})</span>
            <span className="sm:hidden">Hoje<br/>({todayAppointments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="amanha" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-2 touch-target">
            <span className="hidden sm:inline">Amanhã ({tomorrowAppointments.length})</span>
            <span className="sm:hidden">Amanhã<br/>({tomorrowAppointments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="todos" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-2 touch-target">
            <span className="hidden sm:inline">Todos ({filteredAppointments.length})</span>
            <span className="sm:hidden">Todos<br/>({filteredAppointments.length})</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="text-xs sm:text-sm px-2 sm:px-3 py-2.5 sm:py-2 touch-target">
            <span className="hidden sm:inline">Por Data</span>
            <span className="sm:hidden">Data</span>
          </TabsTrigger>
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