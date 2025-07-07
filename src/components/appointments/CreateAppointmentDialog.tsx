
import React, { useState } from 'react';
import { Calendar, Clock, User, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppointments } from '@/hooks/useAppointments';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { toast } from 'sonner';

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAppointmentDialog = ({ open, onOpenChange }: CreateAppointmentDialogProps) => {
  const { createAppointment, appointments } = useAppointments();
  const { hasReachedLimit } = usePlanLimits();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: '',
    service_name: '',
    appointment_date: '',
    appointment_time: '',
    duration: 60,
    price: 0,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('Form submitted with data:', formData);
    
    if (!formData.client_name || !formData.service_name || !formData.appointment_date || !formData.appointment_time) {
      console.log('Missing required fields');
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Check plan limits
    if (hasReachedLimit('appointments', appointments.length)) {
      toast.error('Limite de agendamentos atingido para seu plano atual');
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentPayload = {
        client_name: formData.client_name,
        service_name: formData.service_name,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        duration: formData.duration,
        status: 'agendado' as const,
        price: formData.price,
        notes: formData.notes || undefined
      };

      console.log('Creating appointment with payload:', appointmentPayload);

      const result = await createAppointment(appointmentPayload);

      console.log('Create appointment result:', result);

      if (result) {
        setFormData({
          client_name: '',
          service_name: '',
          appointment_date: '',
          appointment_time: '',
          duration: 60,
          price: 0,
          notes: ''
        });
        onOpenChange(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div className="space-y-2">
              <Label htmlFor="client" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente *
              </Label>
              <Input
                id="client"
                placeholder="Nome do cliente"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                required
              />
            </div>

            {/* Service */}
            <div className="space-y-2">
              <Label htmlFor="service" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Serviço *
              </Label>
              <Input
                id="service"
                placeholder="Nome do serviço"
                value={formData.service_name}
                onChange={(e) => handleInputChange('service_name', e.target.value)}
                required
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Data *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.appointment_time}
                onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                required
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="60"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                min="1"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais sobre o agendamento..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-plush-600 hover:bg-plush-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Agendamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
