
import React, { useState } from 'react';
import { Calendar, Plus, Search } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppointmentsList } from '@/components/appointments/AppointmentsList';
import { CreateAppointmentDialog } from '@/components/appointments/CreateAppointmentDialog';
import { AppointmentFiltersAdvanced, type AppointmentFilters } from '@/components/appointments/AppointmentFiltersAdvanced';
import { WorkingHoursSetup } from '@/components/appointments/WorkingHoursSetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LimitAlert } from '@/components/LimitAlert';
import { useAppointments } from '@/hooks/useAppointments';

const Appointments = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const { appointments } = useAppointments();

  const headerActions = (
    <Button 
      onClick={() => setIsCreateDialogOpen(true)} 
      className="gap-2 touch-target"
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">Novo Agendamento</span>
      <span className="sm:hidden">Novo</span>
    </Button>
  );

  return (
    <>
      <ResponsiveLayout
        title="Agendamentos"
        subtitle="Gerencie agendamentos e configurações"
        icon={Calendar}
        actions={headerActions}
      >
        {/* Limit Alert */}
        <LimitAlert type="appointments" currentCount={appointments.length} action="criar" />
        
        <Tabs defaultValue="agenda" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agenda" className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente, serviço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <AppointmentFiltersAdvanced
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={() => setFilters({})}
                />
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)} 
                  className="bg-plush-600 hover:bg-plush-700 sm:hidden touch-target"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo
                </Button>
              </div>
            </div>
            
            <AppointmentsList searchQuery={searchQuery} filters={filters} />
          </TabsContent>
          
          <TabsContent value="config" className="space-y-6">
            <WorkingHoursSetup />
          </TabsContent>
        </Tabs>
      </ResponsiveLayout>

      {/* Dialogs */}
      <CreateAppointmentDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </>
  );
};

export default Appointments;
