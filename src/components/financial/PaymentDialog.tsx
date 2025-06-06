
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/components/ui/sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment?: any;
}

const PaymentDialog = ({ open, onOpenChange, payment }: PaymentDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    description: payment?.description || '',
    amount: payment?.amount || '',
    payment_method_id: payment?.payment_method_id || '',
    client_id: payment?.client_id || '',
    appointment_id: payment?.appointment_id || '',
    due_date: payment?.due_date ? payment.due_date.split('T')[0] : '',
    notes: payment?.notes || '',
    status: payment?.status || 'pendente'
  });

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

  const { data: clients } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: appointments } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('id, title')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      if (payment) {
        const { error } = await supabase
          .from('payments')
          .update(data)
          .eq('id', payment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('payments')
          .insert([{ ...data, user_id: user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast.success(payment ? 'Pagamento atualizado!' : 'Pagamento criado!');
      onOpenChange(false);
      setFormData({
        description: '',
        amount: '',
        payment_method_id: '',
        client_id: '',
        appointment_id: '',
        due_date: '',
        notes: '',
        status: 'pendente'
      });
    },
    onError: (error) => {
      toast.error('Erro ao salvar pagamento');
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.payment_method_id) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    mutation.mutate({
      ...formData,
      amount: parseFloat(formData.amount),
      client_id: formData.client_id || null,
      appointment_id: formData.appointment_id || null,
      due_date: formData.due_date || null,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {payment ? 'Editar Pagamento' : 'Novo Pagamento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descrição do pagamento"
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
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pagamento *</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select value={formData.client_id} onValueChange={(value) => handleChange('client_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment">Agendamento</Label>
              <Select value={formData.appointment_id} onValueChange={(value) => handleChange('appointment_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o agendamento" />
                </SelectTrigger>
                <SelectContent>
                  {appointments?.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {appointment.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => handleChange('due_date', e.target.value)}
            />
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
              {mutation.isPending ? 'Salvando...' : payment ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;
