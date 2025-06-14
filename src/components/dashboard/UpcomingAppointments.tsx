
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useAppointments } from '@/hooks/useAppointments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const UpcomingAppointments = () => {
  const navigate = useNavigate();
  const { appointments, loading } = useAppointments();

  // Filtrar apenas os agendamentos de hoje
  const todayAppointments = appointments.filter(appointment => {
    const today = new Date();
    return appointment.date.toDateString() === today.toDateString();
  }).slice(0, 3); // Mostrar apenas os 3 primeiros

  const handleViewAll = () => {
    navigate('/appointments');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Próximos Agendamentos
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-muted-foreground">
            Carregando agendamentos...
          </div>
        ) : todayAppointments.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum agendamento para hoje
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{appointment.client}</p>
                  <p className="text-sm text-muted-foreground">{appointment.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{appointment.time}</p>
                  <p className="text-xs text-muted-foreground">{appointment.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
