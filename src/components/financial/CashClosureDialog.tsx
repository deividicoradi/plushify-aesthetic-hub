
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

interface CashClosureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CashClosureDialog = ({ open, onOpenChange }: CashClosureDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    closure_date: new Date().toISOString().split('T')[0],
    opening_balance: '',
    closing_balance: '',
    total_income: '',
    total_expenses: '',
    cash_amount: '',
    card_amount: '',
    pix_amount: '',
    other_amount: '',
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const calculatedDifference = Number(data.closing_balance) - Number(data.opening_balance);
      
      const { error } = await supabase
        .from('cash_closures')
        .insert([{ 
          ...data, 
          user_id: user?.id,
          difference: calculatedDifference,
          status: 'fechado',
          closed_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-closures'] });
      toast.success('Fechamento de caixa criado!');
      onOpenChange(false);
      setFormData({
        closure_date: new Date().toISOString().split('T')[0],
        opening_balance: '',
        closing_balance: '',
        total_income: '',
        total_expenses: '',
        cash_amount: '',
        card_amount: '',
        pix_amount: '',
        other_amount: '',
        notes: ''
      });
    },
    onError: (error) => {
      toast.error('Erro ao criar fechamento de caixa');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.closure_date || !formData.closing_balance) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const processedData = {
      ...formData,
      opening_balance: parseFloat(formData.opening_balance) || 0,
      closing_balance: parseFloat(formData.closing_balance),
      total_income: parseFloat(formData.total_income) || 0,
      total_expenses: parseFloat(formData.total_expenses) || 0,
      cash_amount: parseFloat(formData.cash_amount) || 0,
      card_amount: parseFloat(formData.card_amount) || 0,
      pix_amount: parseFloat(formData.pix_amount) || 0,
      other_amount: parseFloat(formData.other_amount) || 0,
    };

    mutation.mutate(processedData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const cash = parseFloat(formData.cash_amount) || 0;
    const card = parseFloat(formData.card_amount) || 0;
    const pix = parseFloat(formData.pix_amount) || 0;
    const other = parseFloat(formData.other_amount) || 0;
    return cash + card + pix + other;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Fechamento de Caixa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="closure_date">Data do Fechamento *</Label>
            <Input
              id="closure_date"
              type="date"
              value={formData.closure_date}
              onChange={(e) => handleChange('closure_date', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opening_balance">Saldo Inicial</Label>
              <Input
                id="opening_balance"
                type="number"
                step="0.01"
                value={formData.opening_balance}
                onChange={(e) => handleChange('opening_balance', e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closing_balance">Saldo Final *</Label>
              <Input
                id="closing_balance"
                type="number"
                step="0.01"
                value={formData.closing_balance}
                onChange={(e) => handleChange('closing_balance', e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total_income">Total de Receitas</Label>
              <Input
                id="total_income"
                type="number"
                step="0.01"
                value={formData.total_income}
                onChange={(e) => handleChange('total_income', e.target.value)}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_expenses">Total de Despesas</Label>
              <Input
                id="total_expenses"
                type="number"
                step="0.01"
                value={formData.total_expenses}
                onChange={(e) => handleChange('total_expenses', e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Detalhamento por Método de Pagamento</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cash_amount">Dinheiro</Label>
                <Input
                  id="cash_amount"
                  type="number"
                  step="0.01"
                  value={formData.cash_amount}
                  onChange={(e) => handleChange('cash_amount', e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card_amount">Cartão</Label>
                <Input
                  id="card_amount"
                  type="number"
                  step="0.01"
                  value={formData.card_amount}
                  onChange={(e) => handleChange('card_amount', e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_amount">PIX</Label>
                <Input
                  id="pix_amount"
                  type="number"
                  step="0.01"
                  value={formData.pix_amount}
                  onChange={(e) => handleChange('pix_amount', e.target.value)}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="other_amount">Outros</Label>
                <Input
                  id="other_amount"
                  type="number"
                  step="0.01"
                  value={formData.other_amount}
                  onChange={(e) => handleChange('other_amount', e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Total calculado: {formatCurrency(calculateTotal())}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações sobre o fechamento"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : 'Criar Fechamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashClosureDialog;
