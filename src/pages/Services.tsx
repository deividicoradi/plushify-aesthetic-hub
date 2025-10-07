
import React, { useState } from 'react';
import { Plus, Wrench } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { ServiceForm } from '@/components/services/ServiceForm';
import { ServicesList } from '@/components/services/ServicesList';
import ServicesSearchAndFilters from '@/components/services/ServicesSearchAndFilters';
import { useServices, Service } from '@/hooks/useServices';
import { Professional } from '@/hooks/useProfessionals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LimitAlert } from '@/components/LimitAlert';
import { toast } from 'sonner';

const Services = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { services, isLoading, createService, updateService, deleteService, toggleServiceStatus } = useServices();

  const saveServiceProfessionals = async (serviceId: string, professionals: Professional[]) => {
    if (!user) return;

    try {
      // Remove existing associations
      await supabase
        .from('service_professionals')
        .delete()
        .eq('service_id', serviceId)
        .eq('user_id', user.id);

      // Add new associations
      if (professionals.length > 0) {
        const associations = professionals.map(prof => ({
          user_id: user.id,
          service_id: serviceId,
          professional_id: prof.id
        }));

        const { error } = await supabase
          .from('service_professionals')
          .insert(associations);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving service professionals:', error);
      toast.error('Erro ao salvar profissionais do serviço');
    }
  };

  const handleCreateService = async (data: any, professionals: Professional[]) => {
    const success = await createService(data);
    
    if (success && user && professionals.length > 0) {
      // Find the created service ID (we need to get the latest service)
      try {
        const { data: latestServices } = await supabase
          .from('services')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', data.name)
          .order('created_at', { ascending: false })
          .limit(1);

        if (latestServices && latestServices.length > 0) {
          await saveServiceProfessionals(latestServices[0].id, professionals);
        }
      } catch (error) {
        console.error('Error linking professionals to service:', error);
      }
    }
    
    return success;
  };

  const handleUpdateService = async (data: any, professionals: Professional[]) => {
    if (!editingService) return false;
    
    const success = await updateService(editingService.id, data);
    
    if (success) {
      await saveServiceProfessionals(editingService.id, professionals);
    }
    
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

  // Filter services based on search term
  const filteredServices = services.filter(service => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      service.name.toLowerCase().includes(searchLower) ||
      service.category?.toLowerCase().includes(searchLower) ||
      service.description?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: filteredServices.length,
    active: filteredServices.filter(s => s.active).length,
    inactive: filteredServices.filter(s => !s.active).length,
    averagePrice: filteredServices.length > 0 
      ? filteredServices.reduce((sum, s) => sum + s.price, 0) / filteredServices.length 
      : 0
  };

  return (
    <ResponsiveLayout
      title="Serviços"
      subtitle="Gerencie os serviços oferecidos"
      icon={Wrench}
    >
      {/* Limit Alert */}
      <LimitAlert type="services" currentCount={services.length} action="criar" />
      
      {/* Search and Filters */}
      <ServicesSearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewClick={() => setIsFormOpen(true)}
      />
      
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
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando serviços...</p>
            </div>
          ) : (
            <ServicesList
              services={filteredServices}
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
    </ResponsiveLayout>
  );
};

export default Services;
