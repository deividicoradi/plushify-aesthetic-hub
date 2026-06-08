
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ClientTableRow from './ClientTableRow';
import ClientActions from './ClientActions';

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
  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
    {/* Mobile / Tablet card view */}
    <div className="md:hidden space-y-3 animate-fade-in">
      {clients.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 border border-border rounded-md bg-card">
          {searchTerm.trim() ? `Nenhum cliente encontrado para "${searchTerm}"` : 'Nenhum cliente encontrado com os filtros selecionados.'}
        </div>
      ) : (
        clients.map((client) => (
          <div
            key={client.id}
            className="rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm hover:shadow transition-shadow"
          >
            <div className="flex items-start gap-3">
              <Avatar className="bg-primary/10 text-primary shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">{getInitials(client.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-foreground truncate">{client.name}</p>
                  <Badge
                    className={cn(
                      "shrink-0",
                      client.status === "Ativo"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                        : "bg-muted text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {client.status}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-muted-foreground">
                  <p className="truncate">
                    <span className="text-foreground/70">Email: </span>
                    {client.email || 'Não informado'}
                  </p>
                  <p className="truncate">
                    <span className="text-foreground/70">Telefone: </span>
                    {client.phone || 'Não informado'}
                  </p>
                  <p className="truncate">
                    <span className="text-foreground/70">Última visita: </span>
                    {client.last_visit || 'Sem visitas'}
                  </p>
                </div>
              </div>
              <div className="shrink-0 -mr-2">
                <ClientActions client={client} onEdit={onEditClient} onDelete={onDeleteClient} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Desktop table view */}
    <div className="hidden md:block rounded-md border border-border bg-card shadow animate-fade-in overflow-x-auto">
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
    </>
  );
};

export default ClientTable;
