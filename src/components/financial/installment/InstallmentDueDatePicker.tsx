
import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface InstallmentDueDatePickerProps {
  dueDate: Date;
  onDueDateChange: (date: Date) => void;
}

const InstallmentDueDatePicker = ({ dueDate, onDueDateChange }: InstallmentDueDatePickerProps) => {
  return (
    <div className="space-y-2">
      <Label>Data da Primeira Parcela</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dueDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dueDate ? (
              format(dueDate, "dd/MM/yyyy", { locale: ptBR })
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={dueDate}
            onSelect={(date) => date && onDueDateChange(date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default InstallmentDueDatePicker;
