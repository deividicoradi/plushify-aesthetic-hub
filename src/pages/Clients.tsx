
import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import ClientList from '@/components/clients/ClientList';
import NewClientDialog from "@/components/clients/NewClientDialog";
import ClientsSearchAndFilters from '@/components/clients/ClientsSearchAndFilters';
import ClientsStatsCards from '@/components/clients/ClientsStatsCards';
import { useClientStats } from '@/hooks/useClientStats';
import { LimitAlert } from '@/components/LimitAlert';

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
    <>
      <ResponsiveLayout
        title="Clientes"
        subtitle="Gerencie seus clientes e histórico"
        icon={Users}
      >
        {/* Limit Alert */}
        <LimitAlert type="clients" currentCount={totalClients} action="adicionar" />
        
        {/* Search and Filters Section */}
        <ClientsSearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFiltersChange={setFilters}
          onNewClick={() => setDrawerOpen(true)}
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
            <h2 className="text-lg font-semibold text-foreground">Lista de Clientes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize e gerencie todos os seus clientes
            </p>
          </div>
          <div className="p-4 sm:p-6 overflow-x-auto">
            <ClientList filters={filters} searchTerm={searchTerm} onClientUpdate={refetch} />
          </div>
        </div>
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
