
import React from 'react';
import { Calendar } from 'lucide-react';

const Appointments = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Calendar className="w-6 h-6 text-plush-600" />
          <h1 className="text-2xl font-bold">Agendamentos</h1>
        </div>
        <p className="text-muted-foreground">Página em desenvolvimento</p>
      </div>
    </div>
  );
};

export default Appointments;
