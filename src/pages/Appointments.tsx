
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentList from '@/components/appointments/AppointmentList';

const Appointments = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-plush-600" />
            <h1 className="text-2xl font-bold">Agendamentos</h1>
          </div>
          <Button className="bg-plush-600 hover:bg-plush-700">
            Novo Agendamento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <AppointmentCalendar />
          <AppointmentList />
        </div>
      </div>
    </div>
  );
};

export default Appointments;
