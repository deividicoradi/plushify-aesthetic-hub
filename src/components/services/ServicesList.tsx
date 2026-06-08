import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Clock, DollarSign, Package } from 'lucide-react';
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
      <div className="text-center py-12 text-muted-foreground">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">Nenhum serviço cadastrado ainda.</p>
        <p className="text-xs mt-1">Clique em "Novo Serviço" para começar.</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile/Tablet Card View */}
      <div className="md:hidden space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-lg border border-border bg-card p-3 sm:p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-sm truncate">{service.name}</h3>
                  <Badge variant={service.active ? "default" : "secondary"} className="text-[10px]">
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                {service.description && (
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {service.description}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 shrink-0">
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
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              {service.category && (
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {service.category}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(service.duration)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <DollarSign className="w-3.5 h-3.5" />
                <span className="font-medium text-foreground">{formatCurrency(service.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-md border overflow-x-auto">
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
                  <div className="min-w-0">
                    <p className="font-medium truncate">{service.name}</p>
                    {service.description && (
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
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
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatDuration(service.duration)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
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