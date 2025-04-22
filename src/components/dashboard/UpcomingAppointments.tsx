
import React from 'react';
import AppointmentList from '../appointments/AppointmentList';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const UpcomingAppointments = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Agendamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <AppointmentList />
      </CardContent>
    </Card>
  );
};

