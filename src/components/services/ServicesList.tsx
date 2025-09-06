
import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Service } from '@/hooks/useServices';

interface ServicesListProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, active: boolean) => void;
}

export const ServicesList = ({ services, onEdit, onDelete, onToggleStatus }: ServicesListProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { user } = useAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const checkServiceAppointments = async (serviceId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('id')
        .eq('user_id', user.id)
        .eq('service_id', serviceId)
        .in('status', ['agendado', 'confirmado', 'concluido']);

      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Erro ao verificar agendamentos:', error);
      return false;
    }
  };

  const handleDelete = async (id: string) => {
    const hasAppointments = await checkServiceAppointments(id);
    
    if (hasAppointments) {
      toast.error('Não é possível excluir registro que tenha Agendamentos com status Agendado, Confirmado e Concluído.');
      setDeleteId(null);
      return;
    }
    
    onDelete(id);
    setDeleteId(null);
  };

  if (services.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Nenhum serviço cadastrado ainda.</p>
        <p className="text-sm">Clique em "Novo Serviço" para começar.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {service.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {service.category && (
                    <Badge variant="outline">
                      {service.category}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {formatDuration(service.duration)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {formatCurrency(service.price)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={service.active ? "default" : "secondary"}>
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(service)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setDeleteId(service.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este serviço? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
