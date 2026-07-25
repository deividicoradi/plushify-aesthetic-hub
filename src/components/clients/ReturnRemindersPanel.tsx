import React from 'react';
import { UserX, Send, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReturnReminders } from '@/hooks/clients/useReturnReminders';
import { buildReturnReminderMessage } from '@/utils/clients/returnReminderMessage';
import { buildWhatsAppLink } from '@/utils/appointments/reminderMessage';

export const ReturnRemindersPanel = () => {
  const { lapsedClients, isLoading, markReminderSent, thresholdDays } = useReturnReminders();

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <UserX className="w-4 h-4 sm:w-5 sm:h-5" />
          Clientes para reengajar ({lapsedClients.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Clientes sem visita concluída há {thresholdDays} dias ou mais.
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {isLoading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : lapsedClients.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <UserX className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Nenhum cliente sumido</h3>
            <p className="text-sm text-muted-foreground">
              Todos os clientes com histórico de visita estão dentro dos últimos {thresholdDays} dias.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {lapsedClients.map((client) => {
              const message = buildReturnReminderMessage(client.name);
              const whatsappUrl = buildWhatsAppLink(client.phone, message);
              // Considera "enviado" só se o lembrete foi mandado DEPOIS da
              // última visita registrada — se o cliente voltou e sumiu de
              // novo, o lembrete antigo não deve contar pro novo período.
              const wasSent = !!client.return_reminder_sent_at
                && new Date(client.return_reminder_sent_at) > new Date(client.last_visit);

              return (
                <div
                  key={client.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border p-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Sem visita há {client.daysSinceVisit} dias
                      {!client.phone && ' · sem telefone cadastrado'}
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
                        onClick={() => markReminderSent(client.id)}
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
  );
};
