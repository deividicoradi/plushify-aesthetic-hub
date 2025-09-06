
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface CashOpeningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  opening?: any;
}

const CashOpeningDialog = ({ open, onOpenChange, onSuccess, opening }: CashOpeningDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    opening_date: new Date().toISOString().split('T')[0],
    opening_balance: '',
    cash_amount: '',
    card_amount: '',
    pix_amount: '',
    other_amount: '',
    notes: '',
    operator_id: user?.id || '',
    machine_id: ''
  });

  useEffect(() => {
    if (opening) {
      setFormData({
        opening_date: opening.opening_date || new Date().toISOString().split('T')[0],
        opening_balance: opening.opening_balance?.toString() || '',
        cash_amount: opening.cash_amount?.toString() || '',
        card_amount: opening.card_amount?.toString() || '',
        pix_amount: opening.pix_amount?.toString() || '',
        other_amount: opening.other_amount?.toString() || '',
        notes: opening.notes || '',
        operator_id: opening.operator_id || user?.id || '',
        machine_id: opening.machine_id || ''
      });
    } else {
      // Get machine identifier (browser fingerprint)
      const getMachineId = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Machine ID', 2, 2);
        return canvas.toDataURL().slice(-50);
      };

      setFormData({
        opening_date: new Date().toISOString().split('T')[0],
        opening_balance: '',
        cash_amount: '',
        card_amount: '',
        pix_amount: '',
        other_amount: '',
        notes: '',
        operator_id: user?.id || '',
        machine_id: getMachineId()
      });
    }
  }, [opening, open]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (opening) {
        const { error } = await supabase
          .from('cash_openings')
          .update(data)
          .eq('id', opening.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cash_openings')
          .insert([{ 
            ...data, 
            user_id: user?.id,
            status: 'aberto',
            opened_at: new Date().toISOString()
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-openings'] });
      toast({
        title: "Sucesso!",
        description: opening ? "Abertura atualizada!" : "Abertura de caixa criada com sucesso.",
      });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar abertura de caixa",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.opening_date) {
      toast({
        title: "Erro",
        description: "Preencha a data de abertura",
        variant: "destructive",
      });
      return;
    }

    const processedData = {
      opening_date: formData.opening_date,
      opening_balance: parseFloat(formData.opening_balance) || 0,
      cash_amount: parseFloat(formData.cash_amount) || 0,
      card_amount: parseFloat(formData.card_amount) || 0,
      pix_amount: parseFloat(formData.pix_amount) || 0,
      other_amount: parseFloat(formData.other_amount) || 0,
      notes: formData.notes || null,
      operator_id: formData.operator_id || user?.id,
      machine_id: formData.machine_id || null,
    };

    mutation.mutate(processedData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateTotal = () => {
    const balance = parseFloat(formData.opening_balance) || 0;
    const cash = parseFloat(formData.cash_amount) || 0;
    const card = parseFloat(formData.card_amount) || 0;
    const pix = parseFloat(formData.pix_amount) || 0;
    const other = parseFloat(formData.other_amount) || 0;
    // O saldo inicial NÃO deve somar com os métodos de pagamento
    // Os métodos de pagamento são apenas para controle/conferência
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{opening ? 'Editar Abertura de Caixa' : 'Nova Abertura de Caixa'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="opening_date">Data de Abertura *</Label>
            <Input
              id="opening_date"
              type="date"
              value={formData.opening_date}
              onChange={(e) => handleChange('opening_date', e.target.value)}
              required
            />
          </div>

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

          <div className="space-y-4">
            <h3 className="font-semibold">Valores por Método de Pagamento</h3>
            
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

            <div className="p-3 bg-green-50 dark:bg-green-800/20 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Total em caixa: {formatCurrency(calculateTotal())}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operator_id">Operador</Label>
            <Input
              id="operator_id"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="machine_id">Máquina/Terminal</Label>
            <Input
              id="machine_id"
              value={formData.machine_id}
              onChange={(e) => handleChange('machine_id', e.target.value)}
              placeholder="ID da máquina ou terminal"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações sobre a abertura"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : opening ? 'Atualizar' : 'Criar Abertura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashOpeningDialog;
