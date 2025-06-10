
import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import ClientList from '@/components/clients/ClientList';
import NewClientDrawer from "@/components/clients/NewClientDrawer";
import ClientFiltersPopover from "@/components/clients/ClientFiltersPopover";

const Clients = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: 'Todos',
    lastVisit: 'Todos'
  });
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header with sidebar trigger */}
            <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
              <SidebarTrigger />
              <div className="flex items-center justify-between flex-1">
                <div className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                  onClick={() => setDrawerOpen(true)}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Novo Cliente
                </Button>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes..."
                    className="pl-9 max-w-md bg-background border-input"
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
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Clients;
