
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: any;
}

const ExpenseDialog = ({ open, onOpenChange, expense }: ExpenseDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    payment_method_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        category: expense.category || '',
        payment_method_id: expense.payment_method_id || '',
        expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : new Date().toISOString().split('T')[0],
        notes: expense.notes || ''
      });
    } else {
      setFormData({
        description: '',
        amount: '',
        category: '',
        payment_method_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [expense, open]);

  const { data: paymentMethods } = useQuery({
    queryKey: ['payment-methods', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user?.id)
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (expense) {
        const { error } = await supabase
          .from('expenses')
          .update(data)
          .eq('id', expense.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([{ ...data, user_id: user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast({
        title: "Sucesso!",
        description: expense ? "Despesa atualizada!" : "Despesa criada!",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar despesa",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      payment_method_id: formData.payment_method_id || null,
      expense_date: formData.expense_date,
      notes: formData.notes || null,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const categories = [
    { value: 'material', label: 'Material' },
    { value: 'equipamento', label: 'Equipamento' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'salario', label: 'Salário' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'impostos', label: 'Impostos' },
    { value: 'outros', label: 'Outros' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Editar Despesa' : 'Nova Despesa'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição da despesa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pagamento</Label>
              <Select value={formData.payment_method_id} onValueChange={(value) => handleChange('payment_method_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods?.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_date">Data da Despesa</Label>
              <Input
                id="expense_date"
                type="date"
                value={formData.expense_date}
                onChange={(e) => handleChange('expense_date', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Observações adicionais"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvando...' : expense ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseDialog;
