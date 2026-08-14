import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CATEGORY_LABELS,
  FinanceCategory,
  FinanceEntry,
  FinanceEntryInput,
  FinanceRecurrence,
} from '@/hooks/admin/useAdminFinance';

interface FinanceEntryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: FinanceEntryInput) => Promise<boolean>;
  entry?: FinanceEntry | null;
}

const emptyForm: FinanceEntryInput = {
  description: '',
  category: 'outros',
  amount: 0,
  due_date: '',
  recurrence: 'none',
  notes: '',
};

export const FinanceEntryFormDialog: React.FC<FinanceEntryFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  entry,
}) => {
  const [form, setForm] = useState<FinanceEntryInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setForm({
        description: entry.description,
        category: entry.category,
        amount: entry.amount,
        due_date: entry.due_date,
        recurrence: entry.recurrence,
        notes: entry.notes ?? '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [entry, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim() || !form.due_date || form.amount <= 0) return;
    setSaving(true);
    try {
      const ok = await onSubmit(form);
      if (ok) onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{entry ? 'Editar lançamento' : 'Novo lançamento'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fe-description">Descrição</Label>
            <Input
              id="fe-description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Ex: Assinatura Supabase Pro"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={form.category}
                onValueChange={(value) => setForm((p) => ({ ...p, category: value as FinanceCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recorrência</Label>
              <Select
                value={form.recurrence}
                onValueChange={(value) => setForm((p) => ({ ...p, recurrence: value as FinanceRecurrence }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Única</SelectItem>
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="yearly">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fe-amount">Valor (R$)</Label>
              <Input
                id="fe-amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount === 0 ? '' : form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fe-due-date">Vencimento</Label>
              <Input
                id="fe-due-date"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fe-notes">Observações</Label>
            <Textarea
              id="fe-notes"
              value={form.notes ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Salvando...' : entry ? 'Salvar' : 'Criar lançamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
