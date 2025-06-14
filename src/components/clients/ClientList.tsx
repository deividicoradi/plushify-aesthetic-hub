
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
  };
  searchTerm: string;
  onClientUpdate: () => void;
}> = ({ filters, searchTerm, onClientUpdate }) => {
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
          (client.phone && client.phone.includes(searchTerm))
        );
      }

      // Explicitly cast the data to match our Client type
      setClients(filteredData.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary border-opacity-50"></div>
    </div>;
  }

  return (
    <>
      <div className="rounded-md border border-border bg-card shadow animate-fade-in">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="w-[250px] text-muted-foreground">Cliente</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Telefone</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Última Visita</TableHead>
              <TableHead className="w-[100px] text-right text-muted-foreground">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length === 0 && (
              <TableRow className="border-b border-border">
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {searchTerm.trim() ? `Nenhum cliente encontrado para "${searchTerm}"` : 'Nenhum cliente encontrado com os filtros selecionados.'}
                </TableCell>
              </TableRow>
            )}
            {clients.map((client) => (
              <TableRow key={client.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-primary/10 text-primary">
                      <AvatarFallback className="bg-primary/10 text-primary">{getInitials(client.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-foreground">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground">{client.email || 'Não informado'}</TableCell>
                <TableCell className="text-foreground">{client.phone || 'Não informado'}</TableCell>
                <TableCell>
                  <Badge
                    className={cn(
                      client.status === "Ativo"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                        : "bg-muted text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-foreground">{client.last_visit || 'Sem visitas'}</TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border shadow-md">
                        <DropdownMenuItem 
                          onClick={() => handleEditClient(client)}
                          className="flex items-center gap-2 cursor-pointer text-popover-foreground hover:bg-accent"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClient(client.id)}
                          className="flex items-center gap-2 cursor-pointer text-destructive hover:bg-destructive/10"
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
        onSuccess={handleClientUpdated}
      />
    </>
  );
};

export default ClientList;
