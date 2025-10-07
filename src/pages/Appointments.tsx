
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

  return (
    <>
      <ResponsiveLayout
        title="Agendamentos"
        subtitle="Gerencie agendamentos e configurações"
        icon={Calendar}
      >
        {/* Limit Alert */}
        <LimitAlert type="appointments" currentCount={appointments.length} action="criar" />
        
        <Tabs defaultValue="agenda" className="mt-4 sm:mt-6">
          <TabsList className="grid w-full grid-cols-2 h-11 sm:h-10">
            <TabsTrigger value="agenda" className="text-sm sm:text-base">Agenda</TabsTrigger>
            <TabsTrigger value="config" className="text-sm sm:text-base">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="agenda" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Search and Filters Bar - Mobile Optimized */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Search Bar - Full Width on Mobile */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por cliente, serviço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 sm:h-10"
                />
              </div>
              
              {/* Filter and Novo Button Row */}
              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <AppointmentFiltersAdvanced
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={() => setFilters({})}
                  />
                </div>
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)} 
                  className="gap-2 touch-target"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Novo</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </div>
            </div>
            
            <AppointmentsList 
              searchQuery={searchQuery} 
              filters={filters}
              onCreateNew={() => setIsCreateDialogOpen(true)}
              onClearFilters={() => setFilters({})}
            />
          </TabsContent>
          
          <TabsContent value="config" className="space-y-6 mt-4 sm:mt-6">
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
