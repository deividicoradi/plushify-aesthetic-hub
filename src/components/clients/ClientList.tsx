
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import EditClientDialog from './EditClientDialog';
import ClientTable from './ClientTable';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  cep: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  payment_method: string | null;
  status: string;
  created_at: string;
  last_visit: string | null;
};

const ClientList: React.FC<{
  filters: {
    status: string;
    lastVisit: string;
  };
  searchTerm: string;
  onClientUpdate: () => void;
}> = ({ filters, searchTerm, onClientUpdate }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const { user } = useAuth();
  const { logDelete } = useAuditLog();

  const fetchClients = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filters.status !== "Todos") {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Apply search filter
      let filteredData = data || [];
      if (searchTerm.trim()) {
        filteredData = filteredData.filter(client => 
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.phone && client.phone.includes(searchTerm)) ||
          (client.cpf && client.cpf.includes(searchTerm.replace(/\D/g, '')))
        );
      }

      // Explicitly cast the data to match our Client type
      setClients(filteredData.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        cpf: client.cpf,
        cep: client.cep,
        address: client.address,
        neighborhood: client.neighborhood,
        city: client.city,
        state: client.state,
        payment_method: client.payment_method,
        status: client.status || 'Ativo',
        created_at: client.created_at,
        last_visit: client.last_visit
      })));
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar clientes: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user, filters, searchTerm]);

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditDrawerOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!user) return;
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      // Verificar se o cliente possui agendamentos ativos
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, status')
        .eq('client_id', clientId)
        .eq('user_id', user.id)
        .in('status', ['agendado', 'confirmado', 'concluido']);

      if (appointmentsError) throw appointmentsError;

      if (appointments && appointments.length > 0) {
        toast({
          title: "Erro",
          description: "Não é possível excluir registro que tenha Agendamentos com status Agendado, Confirmado e Concluído.",
          variant: "destructive"
        });
        return;
      }

      // Buscar dados do cliente para auditoria
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .eq('user_id', user.id)
        .single();

      if (clientError) throw clientError;

      // Excluir o cliente
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Log de auditoria
      await logDelete('clients', clientId, clientData, 'Cliente excluído pelo usuário');

      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!"
      });
      
      fetchClients();
      onClientUpdate(); // Update stats
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleClientUpdated = () => {
    fetchClients();
    onClientUpdate(); // Update stats
  };

  if (loading) {
    return <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-opacity-50"></div>
    </div>;
  }

  return (
    <>
      <ClientTable 
        clients={clients}
        searchTerm={searchTerm}
        onEditClient={handleEditClient}
        onDeleteClient={handleDeleteClient}
      />
      
      <EditClientDialog
        client={selectedClient}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        onSuccess={handleClientUpdated}
      />
    </>
  );
};

export default ClientList;
