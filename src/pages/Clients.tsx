
import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import ClientList from '@/components/clients/ClientList';
import NewClientDialog from "@/components/clients/NewClientDialog";
import ClientsSearchAndFilters from '@/components/clients/ClientsSearchAndFilters';
import ClientsStatsCards from '@/components/clients/ClientsStatsCards';
import { ReturnRemindersPanel } from '@/components/clients/ReturnRemindersPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureGuard } from '@/components/FeatureGuard';
import { useClientStats } from '@/hooks/useClientStats';
import { LimitAlert } from '@/components/LimitAlert';
import { useStaffMode } from '@/contexts/StaffModeContext';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const Clients = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'Todos',
    lastVisit: 'Todos'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebouncedValue(searchTerm);
  const { totalClients, activeClients, newThisMonth, loading, refetch } = useClientStats();
  const { isStaffMode, can } = useStaffMode();
  const canManageClients = !isStaffMode || can('manage_clients');

  const handleClientAdded = () => {
    refetch();
  };

  return (
    <>
      <ResponsiveLayout
        title="Clientes"
        subtitle="Gerencie seus clientes e histórico"
        icon={Users}
      >
        {/* Limit Alert */}
        <LimitAlert type="clients" currentCount={totalClients} action="adicionar" />

        <Tabs defaultValue="lista" className="mt-4 sm:mt-6">
          <TabsList className="grid w-full grid-cols-2 h-11 sm:h-10">
            <TabsTrigger value="lista" className="text-sm sm:text-base">Clientes</TabsTrigger>
            <TabsTrigger value="reengajamento" className="text-sm sm:text-base">Reengajamento</TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {/* Search and Filters Section */}
            <ClientsSearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filters={filters}
              onFiltersChange={setFilters}
              onNewClick={canManageClients ? () => setDrawerOpen(true) : undefined}
            />

            {/* Stats Cards */}
            <ClientsStatsCards
              totalClients={totalClients}
              activeClients={activeClients}
              newThisMonth={newThisMonth}
              loading={loading}
            />

            {/* Client List with Modern Card */}
            <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-border/50">
                <h2 className="text-base sm:text-lg font-semibold text-foreground">Lista de Clientes</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Visualize e gerencie todos os seus clientes
                </p>
              </div>
              <div className="p-3 sm:p-4 lg:p-6">
                <ClientList filters={filters} searchTerm={debouncedSearchTerm} onClientUpdate={refetch} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reengajamento" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <FeatureGuard planFeature="hasReturnReminders">
              <ReturnRemindersPanel />
            </FeatureGuard>
          </TabsContent>
        </Tabs>
      </ResponsiveLayout>

      <NewClientDialog
        open={isDrawerOpen}
        onOpenChange={setDrawerOpen}
        onSuccess={handleClientAdded}
      />
    </>
  );
};

export default Clients;
