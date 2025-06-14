
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ClientActions from './ClientActions';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  last_visit: string | null;
};

interface ClientTableRowProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientTableRow: React.FC<ClientTableRowProps> = ({ client, onEdit, onDelete }) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <TableRow className="border-b border-border hover:bg-muted/50 transition-colors">
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
          <ClientActions client={client} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ClientTableRow;
