
import React from 'react';
import { format } from 'date-fns';
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/components/ui/date-picker-field";

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
  const handleDateChange = (value: string) => {
    onDueDateChange(new Date(`${value}T00:00:00`));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="due_date">Data da Primeira Parcela</Label>
      <DatePickerField
        id="due_date"
        value={format(dueDate, 'yyyy-MM-dd')}
        onChange={handleDateChange}
        disabled={disabled}
      />
    </div>
  );
};

export default InstallmentDueDatePicker;
