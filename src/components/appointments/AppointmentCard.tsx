
import React, { useState } from 'react';
import { Clock, User, Package, MessageCircle, UserCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { format, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAppointments, type Appointment } from '@/hooks/useAppointments';
import { toast } from '@/hooks/use-toast';

interface AppointmentCardProps {
  appointment: Appointment;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

const statusColors = {
  agendado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  confirmado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  concluido: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

const statusLabels = {
  agendado: 'Aguardando Confirmação',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado'
};

export const AppointmentCard = ({ appointment, isSelected = false, onSelect }: AppointmentCardProps) => {
  const { updateAppointment, deleteAppointment } = useAppointments();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatTime = (time: string) => {
    // Se já está no formato HH:MM, retorna como está
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    return time;
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleStatusChange = async (newStatus: Appointment['status']) => {
    // Validações específicas
    if (newStatus === 'cancelado') {
      const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const hoursUntilAppointment = differenceInHours(appointmentDateTime, new Date());
      
      if (hoursUntilAppointment < 24) {
        toast({
          title: "Cancelamento não permitido",
          description: "Só é permitido cancelamento com até 24h de antecedência.",
          variant: "destructive"
        });
        return;
      }
    }

    if (newStatus === 'concluido' && appointment.status !== 'confirmado') {
      toast({
        title: "Conclusão não permitida",
        description: "Só é possível concluir agendamentos com status confirmado.",
        variant: "destructive"
      });
      return;
    }

    console.log('Changing status to:', newStatus);
    await updateAppointment(appointment.id, { status: newStatus });
  };

  const handleDeleteClick = () => {
    // Validação: só permitir excluir agendamentos aguardando confirmação e cancelados
    if (appointment.status === 'confirmado' || appointment.status === 'concluido') {
      toast({
        title: "Exclusão não permitida",
        description: "Só é possível excluir agendamentos com status 'aguardando confirmação' e 'cancelados'.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Delete button clicked for appointment:', appointment.id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('Delete confirmed for appointment:', appointment.id);
    setIsDeleting(true);
    
    try {
      const success = await deleteAppointment(appointment.id);
      if (success) {
        console.log('Appointment deleted successfully, closing dialog');
        setShowDeleteDialog(false);
      }
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    console.log('Delete cancelled');
    setShowDeleteDialog(false);
  };

  const sendWhatsAppMessage = () => {
    const message = `Olá ${appointment.client_name}! 

Confirmo seu agendamento:
📅 Data: ${formatDate(appointment.appointment_date)}
⏰ Horário: ${appointment.appointment_time}
✂️ Serviço: ${appointment.service_name}
⏱️ Duração: ${appointment.duration} minutos
💰 Valor: ${formatPrice(appointment.price)}

Nos vemos em breve!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow duration-200 ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Checkbox para seleção */}
            {onSelect && (
              <div className="pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                />
              </div>
            )}

            <div className="flex-1 space-y-3">
              {/* Header with client info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-plush-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-plush-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {appointment.client_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(appointment.appointment_date)}
                    </p>
                  </div>
                </div>
                
                {/* Status and Actions moved to header for better space usage */}
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[appointment.status]}>
                    {statusLabels[appointment.status]}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={sendWhatsAppMessage}
                    className="text-green-600 border-green-200 hover:bg-green-50 shrink-0"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>

              {/* Service, time and professional info */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">{appointment.service_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{formatTime(appointment.appointment_time)} ({appointment.duration}min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Profissional Responsável</span>
                </div>
                <div className="font-semibold text-plush-600">
                  {formatPrice(appointment.price)}
                </div>
              </div>

              {/* Notes */}
              {appointment.notes && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Observações:</strong> {appointment.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
