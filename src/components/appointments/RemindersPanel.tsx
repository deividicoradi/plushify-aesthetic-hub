import React, { useMemo, useState } from 'react';
import { CalendarIcon, MessageCircle, Check, Send } from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/hooks/useAppointments';
import { useClients } from '@/hooks/useClients';
import { buildReminderMessage, buildWhatsAppLink } from '@/utils/appointments/reminderMessage';

export const RemindersPanel = () => {
  const { appointments, updateAppointment } = useAppointments();
  const { clients } = useClients();
  const [selectedDate, setSelectedDate] = useState(() => format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const phoneByClientId = useMemo(() => {
    const map = new Map<string, string | undefined>();
    clients.forEach((c) => map.set(c.id, c.phone));
    return map;
  }, [clients]);

  const reminders = useMemo(() => {
    return appointments
      .filter((apt) => {
        const matchesDate = format(parseISO(apt.appointment_date), 'yyyy-MM-dd') === selectedDate;
        const matchesStatus = apt.status === 'agendado' || apt.status === 'confirmado';
        return matchesDate && matchesStatus;
      })
      .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  }, [appointments, selectedDate]);

  const handleSendReminder = (appointmentId: string) => {
    updateAppointment(appointmentId, { reminder_sent_at: new Date().toISOString() }).catch(() => {});
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn('w-full sm:w-auto h-11 sm:h-10 justify-start text-left font-normal')}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(parseISO(selectedDate), "dd/MM/yyyy (EEEE)", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={parseISO(selectedDate)}
            onSelect={(date) => {
              if (date) setSelectedDate(format(date, 'yyyy-MM-dd'));
              setDatePickerOpen(false);
            }}
            initialFocus
            className={cn('p-3 pointer-events-auto')}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Lembretes ({reminders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
          {reminders.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nenhum lembrete pendente</h3>
              <p className="text-sm text-muted-foreground">
                Não há agendamentos aguardando confirmação/confirmados para esta data.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((apt) => {
                const phone = apt.client_id ? phoneByClientId.get(apt.client_id) : undefined;
                const message = buildReminderMessage(apt);
                const whatsappUrl = buildWhatsAppLink(phone, message);
                const wasSent = !!apt.reminder_sent_at;

                return (
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{apt.client_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {apt.appointment_time} · {apt.service_name}
                        {!phone && ' · sem telefone cadastrado'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {wasSent && (
                        <Badge variant="secondary" className="gap-1">
                          <Check className="w-3 h-3" /> Enviado
                        </Badge>
                      )}
                      <Button
                        size="sm"
                        variant={wasSent ? 'outline' : 'default'}
                        className="gap-1.5"
                        asChild
                      >
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleSendReminder(apt.id)}
                        >
                          <Send className="w-3.5 h-3.5" />
                          {wasSent ? 'Reenviar' : 'Enviar lembrete'}
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
