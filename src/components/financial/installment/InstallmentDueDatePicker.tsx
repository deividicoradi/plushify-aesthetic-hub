
import React from 'react';
import { format } from 'date-fns';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface InstallmentDueDatePickerProps {
  dueDate: Date;
  onDueDateChange: (date: Date) => void;
  disabled?: boolean;
}

const InstallmentDueDatePicker = ({ 
  dueDate, 
  onDueDateChange, 
  disabled = false 
}: InstallmentDueDatePickerProps) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value + 'T00:00:00');
    onDueDateChange(newDate);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="due_date">Data da Primeira Parcela</Label>
      <Input
        id="due_date"
        type="date"
        value={format(dueDate, 'yyyy-MM-dd')}
        onChange={handleDateChange}
        required
        disabled={disabled}
      />
    </div>
  );
};

export default InstallmentDueDatePicker;
