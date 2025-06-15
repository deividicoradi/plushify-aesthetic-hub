
import React, { useState } from 'react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import ClientList from '@/components/clients/ClientList';
import NewClientDrawer from "@/components/clients/NewClientDrawer";
import ClientsHeader from '@/components/clients/ClientsHeader';
import ClientsSearchAndFilters from '@/components/clients/ClientsSearchAndFilters';
import ClientsStatsCards from '@/components/clients/ClientsStatsCards';
import { useClientStats } from '@/hooks/useClientStats';

const Clients = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'Todos',
    lastVisit: 'Todos'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { totalClients, activeClients, newThisMonth, loading, refetch } = useClientStats();

  const handleClientAdded = () => {
    refetch();
  };

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <ClientsHeader onNewClientClick={() => setDrawerOpen(true)} />

        {/* Main Content with Modern Layout */}
        <main className="flex-1 p-6 space-y-8">
          {/* Search and Filters Section */}
          <ClientsSearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
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
            <div className="p-6 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">Lista de Clientes</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Visualize e gerencie todos os seus clientes
              </p>
            </div>
            <div className="p-6">
              <ClientList filters={filters} searchTerm={searchTerm} onClientUpdate={refetch} />
            </div>
          </div>

          <NewClientDrawer
            open={isDrawerOpen}
            onOpenChange={setDrawerOpen}
            onSuccess={handleClientAdded}
          />
        </main>
      </div>
    </div>
  );
};

export default Clients;
