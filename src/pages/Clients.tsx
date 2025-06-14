
import React, { useState } from 'react';
import { Users, Search, Plus, Filter } from 'lucide-react';
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
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Modern Header */}
            <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
              <div className="flex items-center gap-4 px-6 py-4">
                <SidebarTrigger className="hover:bg-accent/50 transition-colors" />
                <div className="flex items-center justify-between flex-1">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 ring-1 ring-primary/10">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                          Clientes
                        </h1>
                        <p className="text-sm text-muted-foreground">
                          Gerencie sua base de clientes
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 gap-2"
                    onClick={() => setDrawerOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Novo Cliente
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content with Modern Layout */}
            <main className="flex-1 p-6 space-y-8">
              {/* Search and Filters Section */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clientes por nome, email ou telefone..."
                    className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <ClientFiltersPopover
                    filters={filters}
                    setFilters={setFilters}
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                    <Filter className="w-4 h-4" />
                    <span>Filtros ativos</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total de Clientes</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">1,234</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 p-6 rounded-xl border border-green-200/50 dark:border-green-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Clientes Ativos</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">1,156</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 p-6 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Novos Este Mês</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">+47</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <Plus className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Client List with Modern Card */}
              <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border/50">
                  <h2 className="text-lg font-semibold text-foreground">Lista de Clientes</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Visualize e gerencie todos os seus clientes
                  </p>
                </div>
                <div className="p-6">
                  <ClientList filters={filters} />
                </div>
              </div>

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
