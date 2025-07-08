
import React, { useState } from 'react';
import { Calendar, Plus, Filter, Search } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppointmentsList } from '@/components/appointments/AppointmentsList';
import { CreateAppointmentDialog } from '@/components/appointments/CreateAppointmentDialog';
import { AppointmentFiltersAdvanced, type AppointmentFilters } from '@/components/appointments/AppointmentFiltersAdvanced';
import { OnlineScheduling } from '@/components/appointments/OnlineScheduling';
import { WorkingHoursSetup } from '@/components/appointments/WorkingHoursSetup';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LimitAlert } from '@/components/LimitAlert';
import { useAppointments } from '@/hooks/useAppointments';

const Appointments = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AppointmentFilters>({});
  const { appointments } = useAppointments();

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
          <div className="flex items-center justify-between flex-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-plush-600" />
              <h1 className="text-2xl font-bold">Agendamentos</h1>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-plush-600 hover:bg-plush-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Limit Alert */}
          <LimitAlert type="appointments" currentCount={appointments.length} action="criar" />
          
          <Tabs defaultValue="agenda" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="online">Agendamento Online</TabsTrigger>
              <TabsTrigger value="config">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="agenda" className="space-y-6">
              {/* Search and Filters Bar */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por cliente, serviço..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <AppointmentFiltersAdvanced
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClearFilters={() => setFilters({})}
                />
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-plush-600 hover:bg-plush-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
              
              <AppointmentsList searchQuery={searchQuery} filters={filters} />
            </TabsContent>
            
            <TabsContent value="online" className="space-y-6">
              <OnlineScheduling />
            </TabsContent>
            
            <TabsContent value="config" className="space-y-6">
              <WorkingHoursSetup />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Dialogs */}
      <CreateAppointmentDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

export default Appointments;
