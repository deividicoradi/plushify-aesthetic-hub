
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ClientTableRow from './ClientTableRow';

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

interface ClientTableProps {
  clients: Client[];
  searchTerm: string;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, searchTerm, onEditClient, onDeleteClient }) => {
  return (
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
            <ClientTableRow 
              key={client.id} 
              client={client} 
              onEdit={onEditClient} 
              onDelete={onDeleteClient} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;
