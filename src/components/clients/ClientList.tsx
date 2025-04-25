
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string; // Changed from "Ativo" | "Inativo" to string to match Supabase data
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
  const { user } = useAuth();

  useEffect(() => {
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
        toast.error("Erro ao carregar clientes: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user, filters]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return <div>Carregando clientes...</div>;
  }

  return (
    <div className="rounded-md border bg-white/70 shadow animate-fade-in">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Cliente</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Última Visita</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhum cliente encontrado com os filtros selecionados.
              </TableCell>
            </TableRow>
          )}
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-pink-50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientList;
