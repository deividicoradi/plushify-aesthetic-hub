import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment } from '@/hooks/useAppointments';
import { cn } from '@/lib/utils';

interface AppointmentListRowProps {
  appointment: Appointment;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

const statusColors: Record<Appointment['status'], string> = {
  agendado: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  confirmado: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  concluido: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
  cancelado: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

const statusLabels: Record<Appointment['status'], string> = {
  agendado: 'Aguardando',
  confirmado: 'Confirmado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const AppointmentListRow = ({ appointment, isSelected = false, onSelect }: AppointmentListRowProps) => {
  const [showDetail, setShowDetail] = useState(false);

  const formatPrice = (price: number) =>
    price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setShowDetail(true)}
        onKeyDown={(e) => { if (e.key === 'Enter') setShowDetail(true); }}
        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
      >
        {onSelect && (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />
          </div>
        )}

        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
          <div className="min-w-0">
            <p className="font-medium truncate">{appointment.client_name}</p>
            <p className="text-xs text-muted-foreground truncate">{appointment.service_name}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(parseISO(appointment.appointment_date), 'dd/MM/yyyy', { locale: ptBR })} · {formatTime(appointment.appointment_time)}
          </div>
          <div>
            <span className={cn('inline-block px-2 py-0.5 rounded-md text-xs font-medium border', statusColors[appointment.status])}>
              {statusLabels[appointment.status]}
            </span>
          </div>
          <div className="text-sm font-semibold text-right sm:text-left">
            {formatPrice(appointment.price)}
          </div>
        </div>
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-lg p-0">
          <AppointmentCard appointment={appointment} />
        </DialogContent>
      </Dialog>
    </>
  );
};
