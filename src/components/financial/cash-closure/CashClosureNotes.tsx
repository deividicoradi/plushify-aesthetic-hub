
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CashClosureNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

const CashClosureNotes = ({ notes, onNotesChange }: CashClosureNotesProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="notes" className="text-foreground">Observações</Label>
      <Textarea
        id="notes"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Observações sobre o fechamento"
        className="bg-background border-border text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
};

export default CashClosureNotes;
