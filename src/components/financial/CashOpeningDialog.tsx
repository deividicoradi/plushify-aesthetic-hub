
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface CashOpeningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface CashOpeningFormData {
  opening_date: string;
  opening_balance: number;
  cash_amount: number;
  card_amount: number;
  pix_amount: number;
  other_amount: number;
  notes?: string;
}

const CashOpeningDialog = ({ open, onOpenChange, onSuccess }: CashOpeningDialogProps) => {
  const { user } = useAuth();
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<CashOpeningFormData>({
    defaultValues: {
      opening_date: new Date().toISOString().split('T')[0],
      opening_balance: 0,
      cash_amount: 0,
      card_amount: 0,
      pix_amount: 0,
      other_amount: 0,
      notes: ''
    }
  });

  const watchedValues = watch();
  const calculatedBalance = Number(watchedValues.cash_amount || 0) + 
                           Number(watchedValues.card_amount || 0) + 
                           Number(watchedValues.pix_amount || 0) + 
                           Number(watchedValues.other_amount || 0);

  const onSubmit = async (data: CashOpeningFormData) => {
    try {
      const { error } = await supabase
        .from('cash_openings')
        .insert({
          user_id: user?.id,
          opening_date: data.opening_date,
          opening_balance: calculatedBalance,
          cash_amount: Number(data.cash_amount),
          card_amount: Number(data.card_amount),
          pix_amount: Number(data.pix_amount),
          other_amount: Number(data.other_amount),
          notes: data.notes,
          status: 'aberto'
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Caixa aberto com sucesso.",
      });

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao abrir caixa",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Abertura de Caixa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="opening_date">Data de Abertura</Label>
              <Input
                id="opening_date"
                type="date"
                {...register('opening_date', { required: true })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Valores Iniciais</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cash_amount">Dinheiro</Label>
                <Input
                  id="cash_amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('cash_amount', { valueAsNumber: true })}
                />
              </div>
              
              <div>
                <Label htmlFor="card_amount">Cartão</Label>
                <Input
                  id="card_amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('card_amount', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pix_amount">PIX</Label>
                <Input
                  id="pix_amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('pix_amount', { valueAsNumber: true })}
                />
              </div>
              
              <div>
                <Label htmlFor="other_amount">Outros</Label>
                <Input
                  id="other_amount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('other_amount', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Saldo Inicial Total: {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(calculatedBalance)}
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre a abertura do caixa..."
              {...register('notes')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Abrindo...' : 'Abrir Caixa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashOpeningDialog;
