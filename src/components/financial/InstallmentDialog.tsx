
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

interface InstallmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  installment?: any;
}

const InstallmentDialog = ({ open, onOpenChange, onSuccess, installment }: InstallmentDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    payment_id: '',
    total_installments: 2,
    amount: '',
    due_date: new Date(),
    notes: ''
  });

  // Buscar pagamentos disponíveis
  const { data: payments } = useQuery({
    queryKey: ['payments-for-installments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, description, amount')
        .eq('user_id', user?.id)
        .eq('status', 'pago');

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && open,
  });

  useEffect(() => {
    if (installment) {
      setFormData({
        payment_id: installment.payment_id || '',
        total_installments: installment.total_installments || 2,
        amount: installment.amount?.toString() || '',
        due_date: installment.due_date ? new Date(installment.due_date) : new Date(),
        notes: installment.notes || ''
      });
    } else {
      setFormData({
        payment_id: '',
        total_installments: 2,
        amount: '',
        due_date: new Date(),
        notes: ''
      });
    }
  }, [installment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.payment_id || !formData.amount) return;

    setLoading(true);
    try {
      const selectedPayment = payments?.find(p => p.id === formData.payment_id);
      const installmentAmount = Number(formData.amount);

      // Criar as parcelas
      const installments = [];
      for (let i = 1; i <= formData.total_installments; i++) {
        const dueDate = new Date(formData.due_date);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));

        installments.push({
          user_id: user.id,
          payment_id: formData.payment_id,
          installment_number: i,
          total_installments: formData.total_installments,
          amount: installmentAmount,
          due_date: dueDate.toISOString(),
          status: 'pendente',
          notes: formData.notes
        });
      }

      const { error } = await supabase
        .from('installments')
        .insert(installments);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Parcelamento criado com ${formData.total_installments} parcelas.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar parcelamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {installment ? 'Editar Parcelamento' : 'Novo Parcelamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_id">Pagamento Base</Label>
            <Select 
              value={formData.payment_id} 
              onValueChange={(value) => setFormData({ ...formData, payment_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um pagamento" />
              </SelectTrigger>
              <SelectContent>
                {payments?.map((payment) => (
                  <SelectItem key={payment.id} value={payment.id}>
                    {payment.description} - R$ {Number(payment.amount).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_installments">Número de Parcelas</Label>
              <Input
                id="total_installments"
                type="number"
                min="2"
                max="12"
                value={formData.total_installments}
                onChange={(e) => setFormData({ ...formData, total_installments: Number(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor por Parcela</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data da Primeira Parcela</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.due_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.due_date ? (
                    format(formData.due_date, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.due_date}
                  onSelect={(date) => date && setFormData({ ...formData, due_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações sobre o parcelamento..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : installment ? "Salvar" : "Criar Parcelamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InstallmentDialog;
