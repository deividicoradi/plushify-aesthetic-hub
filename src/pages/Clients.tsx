
import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ClientList from '@/components/clients/ClientList';
import NewClientDrawer from "@/components/clients/NewClientDrawer";
import ClientFiltersPopover from "@/components/clients/ClientFiltersPopover";

const Clients = () => {
  // Estados de abertura dos popups
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'Todos',
    lastVisit: 'Todos'
  });
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-pink-500" />
            <h1 className="text-2xl font-bold">Clientes</h1>
          </div>
          <Button
            className="bg-pink-500 hover:bg-pink-600 transition-colors"
            onClick={() => setDrawerOpen(true)}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Novo Cliente
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-9 max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ClientFiltersPopover
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        <ClientList filters={filters} />

        <NewClientDrawer
          open={isDrawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </div>
    </div>
  );
};

export default Clients;
