
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InstallmentNotesFieldProps {
  notes: string;
  onNotesChange: (value: string) => void;
  disabled?: boolean;
}

const InstallmentNotesField = ({ 
  notes, 
  onNotesChange, 
  disabled = false 
}: InstallmentNotesFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Observações</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Observações sobre o parcelamento..."
        rows={3}
        disabled={disabled}
      />
    </div>
  );
};

export default InstallmentNotesField;
