import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical, Calendar } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  last_visit: string | null;
};

interface ClientActionsProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientActions: React.FC<ClientActionsProps> = ({ client, onEdit, onDelete }) => {
  const navigate = useNavigate();

  const handleScheduleClick = () => {
    navigate('/appointments', { state: { selectedClientId: client.id, selectedClientName: client.name } });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border shadow-md">
        <DropdownMenuItem 
          onClick={() => onEdit(client)}
          className="flex items-center gap-2 cursor-pointer text-popover-foreground hover:bg-accent"
        >
          <Edit className="h-4 w-4" />
          <span>Editar</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleScheduleClick}
          className="flex items-center gap-2 cursor-pointer text-popover-foreground hover:bg-accent"
        >
          <Calendar className="h-4 w-4" />
          <span>Agendamento</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(client.id)}
          className="flex items-center gap-2 cursor-pointer text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ClientActions;