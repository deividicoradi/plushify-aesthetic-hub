import React, { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ServiceForm } from '@/components/services/ServiceForm';
import { ServicesList } from '@/components/services/ServicesList';
import { useServices, Service } from '@/hooks/useServices';

const Services = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const { services, loading, createService, updateService, deleteService, toggleServiceStatus } = useServices();

  const handleCreateService = async (data: any) => {
    const success = await createService(data);
    return success;
  };

  const handleUpdateService = async (data: any) => {
    if (!editingService) return false;
    const success = await updateService(editingService.id, data);
    return success;
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingService(null);
  };

  const stats = {
    total: services.length,
    active: services.filter(s => s.active).length,
    inactive: services.filter(s => !s.active).length,
    averagePrice: services.length > 0 
      ? services.reduce((sum, s) => sum + s.price, 0) / services.length 
      : 0
  };

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex-1">
        <div className="flex flex-col min-h-screen w-full">
          {/* Header with sidebar trigger */}
          <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
            <SidebarTrigger />
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-2">
                <Wrench className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Serviços</h1>
              </div>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Serviço
              </Button>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Serviços Inativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-500">{stats.inactive}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Preço Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(stats.averagePrice)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Services List */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p>Carregando serviços...</p>
                  </div>
                ) : (
                  <ServicesList
                    services={services}
                    onEdit={handleEdit}
                    onDelete={deleteService}
                    onToggleStatus={toggleServiceStatus}
                  />
                )}
              </CardContent>
            </Card>

            {/* Service Form Modal */}
            <ServiceForm
              isOpen={isFormOpen}
              onClose={handleCloseForm}
              onSubmit={editingService ? handleUpdateService : handleCreateService}
              service={editingService}
              title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
            />
          </main>
        </div>
      </SidebarInset>
    </div>
  );
};

export default Services;
