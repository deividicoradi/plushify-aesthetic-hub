
import React, { useState } from 'react';
import AppointmentList from '../appointments/AppointmentList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Appointment } from "@/types/appointment";

export const UpcomingAppointments = () => {
  // Dados de exemplo para os próximos agendamentos
  const [appointments] = useState<Appointment[]>([
    {
      id: 1,
      client: "Maria Silva",
      service: "Corte de Cabelo",
      time: "09:00",
      date: new Date(),
      status: "Confirmado",
    },
    {
      id: 2,
      client: "João Santos",
      service: "Manicure",
      time: "10:30",
      date: new Date(),
      status: "Pendente",
    }
  ]);

  // Função para editar (placeholder - no dashboard apenas visualização)
  const handleEdit = (appointment: Appointment) => {
    console.log('Editar agendamento:', appointment);
  };

  // Função para deletar (placeholder - no dashboard apenas visualização)
  const handleDelete = (id: number) => {
    console.log('Deletar agendamento:', id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <AppointmentList 
          date={new Date()}
          appointments={appointments}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>
    </Card>
  );
};
