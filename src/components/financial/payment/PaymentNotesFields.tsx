
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PaymentNotesFieldsProps {
  notes: string;
  onFieldChange: (field: string, value: string) => void;
  disabled?: boolean;
}

const PaymentNotesFields = ({ notes, onFieldChange, disabled = false }: PaymentNotesFieldsProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes">Observações</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onFieldChange('notes', e.target.value)}
        placeholder="Observações adicionais..."
        rows={3}
        disabled={disabled}
      />
    </div>
  );
};

export default PaymentNotesFields;
