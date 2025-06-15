
import React, { useState } from 'react';
import { Calendar, Plus, Filter, Search } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AppointmentsList } from '@/components/appointments/AppointmentsList';
import { CreateAppointmentDialog } from '@/components/appointments/CreateAppointmentDialog';
import { AppointmentFilters } from '@/components/appointments/AppointmentFilters';

const Appointments = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full">
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

        {/* Search and Filters Bar */}
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-b">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por cliente, serviço..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <AppointmentsList searchQuery={searchQuery} />
        </main>
      </div>

      {/* Dialogs */}
      <CreateAppointmentDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
      
      <AppointmentFilters
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
      />
    </div>
  );
};

export default Appointments;
