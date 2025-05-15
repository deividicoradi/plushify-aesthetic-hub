
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import EditClientDrawer from './EditClientDrawer';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  last_visit: string | null;
};

const ClientList: React.FC<{
  filters: {
    status: string;
    lastVisit: string;
  }
}> = ({ filters }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const { user } = useAuth();

  const fetchClients = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter
      if (filters.status !== "Todos") {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Explicitly cast the data to match our Client type
      setClients(data?.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status || 'Ativo', // Ensure status is not null
        created_at: client.created_at,
        last_visit: client.last_visit
      })) || []);
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
  }, [user, filters]);

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditDrawerOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso!"
      });
      
      fetchClients();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir cliente: " + error.message,
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-500 border-opacity-50"></div>
    </div>;
  }

  return (
    <>
      <div className="rounded-md border bg-white/70 shadow animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Cliente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Visita</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Nenhum cliente encontrado com os filtros selecionados.
                </TableCell>
              </TableRow>
            )}
            {clients.map((client) => (
              <TableRow key={client.id} className="hover:bg-pink-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-pink-100 text-pink-700">
                      <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell>{client.email || 'Não informado'}</TableCell>
                <TableCell>{client.phone || 'Não informado'}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      client.status === "Ativo"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>{client.last_visit || 'Sem visitas'}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white shadow-md">
                        <DropdownMenuItem 
                          onClick={() => handleEditClient(client)}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClient(client.id)}
                          className="flex items-center gap-2 cursor-pointer text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <EditClientDrawer
        client={selectedClient}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        onSuccess={fetchClients}
      />
    </>
  );
};

export default ClientList;
