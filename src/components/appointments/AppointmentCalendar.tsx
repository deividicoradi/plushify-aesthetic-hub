
import { useState } from 'react';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AppointmentCalendarProps {
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const AppointmentCalendar = ({ selectedDate, onDateChange }: AppointmentCalendarProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h3 className="font-medium text-sm">Calendário</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateChange}
            locale={ptBR}
            className="rounded-md border shadow-sm pointer-events-auto"
            initialFocus
          />
          {selectedDate && (
            <div className="text-sm text-muted-foreground">
              Data selecionada: <span className="font-medium text-foreground">{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentCalendar;
