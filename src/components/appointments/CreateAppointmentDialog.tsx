import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Package, UserCheck, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { useProfessionals } from '@/hooks/useProfessionals';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useClients } from '@/hooks/useClients';
import { useClientPackageBalance } from '@/hooks/packages/useClientPackages';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAppointmentDialog = ({ open, onOpenChange }: CreateAppointmentDialogProps) => {
  const { createAppointment, appointments } = useAppointments();
  const { services } = useServices();
  const { professionals, getProfessionalsByService } = useProfessionals();
  const { clients } = useClients();
  const { hasReachedLimit } = usePlanLimits();
  const { slots, fetchAvailableSlots } = useAvailableSlots();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceSearchOpen, setServiceSearchOpen] = useState(false);
  const [professionalSearchOpen, setProfessionalSearchOpen] = useState(false);
  const [clientSearchOpen, setClientSearchOpen] = useState(false);
  const [availableProfessionals, setAvailableProfessionals] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<any>(null);

  const [formData, setFormData] = useState({
    client_name: '',
    client_id: '',
    service_id: '',
    service_name: '',
    professional_id: '',
    appointment_date: '',
    appointment_time: '',
    duration: 60,
    price: 0,
    notes: ''
  });

  const { activePackage } = useClientPackageBalance(formData.client_id || undefined, formData.service_id || undefined);

  // Validação de data retroativa (fuso local — perto da meia-noite no Brasil,
  // toISOString().split('T')[0] "viraria" o dia seguinte e bloquearia agendar
  // para hoje à noite, achando que a data já tinha passado)
  const today = format(new Date(), 'yyyy-MM-dd');

  // Buscar profissionais quando serviço é selecionado
  useEffect(() => {
    if (selectedService) {
      getProfessionalsByService(selectedService.id).then(setAvailableProfessionals);
      setFormData(prev => ({
        ...prev,
        duration: selectedService.duration,
        price: selectedService.price
      }));
    }
  }, [selectedService, getProfessionalsByService]);

  // Auto-selecionar profissional se houver apenas um
  useEffect(() => {
    if (availableProfessionals.length === 1) {
      const professional = availableProfessionals[0];
      setSelectedProfessional(professional);
      setFormData(prev => ({
        ...prev,
        professional_id: professional.id
      }));
    } else {
      setSelectedProfessional(null);
      setFormData(prev => ({
        ...prev,
        professional_id: ''
      }));
    }
  }, [availableProfessionals]);

  // Buscar horários disponíveis
  useEffect(() => {
    if (selectedProfessional && formData.appointment_date) {
      fetchAvailableSlots(formData.appointment_date, formData.duration);
    }
  }, [selectedProfessional, formData.appointment_date, formData.duration, fetchAvailableSlots]);

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setFormData(prev => ({
      ...prev,
      service_id: service.id,
      service_name: service.name,
      duration: service.duration,
      price: service.price
    }));
    setServiceSearchOpen(false);
  };

  const handleProfessionalSelect = (professional: any) => {
    setSelectedProfessional(professional);
    setFormData(prev => ({
      ...prev,
      professional_id: professional.id
    }));
    setProfessionalSearchOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validações
    if (!formData.client_name || !formData.service_id || !formData.professional_id || 
        !formData.appointment_date || !formData.appointment_time) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    // Validação de data retroativa
    if (formData.appointment_date < today) {
      toast.error('Não é possível criar agendamentos com data retroativa');
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
        client_id: formData.client_id || undefined,
        service_name: formData.service_name,
        service_id: formData.service_id,
        professional_id: formData.professional_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        duration: formData.duration,
        status: 'agendado' as const,
        price: formData.price,
        notes: formData.notes || undefined
      };

      const result = await createAppointment(appointmentPayload);

      if (result) {
        // Reset form
        setFormData({
          client_name: '',
          client_id: '',
          service_id: '',
          service_name: '',
          professional_id: '',
          appointment_date: '',
          appointment_time: '',
          duration: 60,
          price: 0,
          notes: ''
        });
        setSelectedService(null);
        setSelectedProfessional(null);
        setAvailableProfessionals([]);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Novo Agendamento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente *
              </Label>
              <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate">{formData.client_name || 'Nome do cliente'}</span>
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Buscar cliente ou digitar novo nome..."
                      value={formData.client_name}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, client_name: value, client_id: '' }));
                      }}
                    />
                    <CommandEmpty>Nenhum cliente cadastrado com esse nome — será salvo sem cadastro vinculado.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {clients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={client.name}
                            onSelect={() => {
                              setFormData((prev) => ({ ...prev, client_name: client.name, client_id: client.id }));
                              setClientSearchOpen(false);
                            }}
                          >
                            {client.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {activePackage && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  Pacote ativo: {activePackage.sessions_used}/{activePackage.total_sessions} sessões usadas
                </Badge>
              )}
            </div>

            {/* Service Search */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Serviço *
              </Label>
              <Popover open={serviceSearchOpen} onOpenChange={setServiceSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {selectedService ? selectedService.name : "Selecione um serviço..."}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar serviço..." />
                    <CommandEmpty>Nenhum serviço encontrado.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {services.map((service) => (
                          <CommandItem
                            key={service.id}
                            onSelect={() => handleServiceSelect(service)}
                          >
                            <div className="flex flex-col">
                              <span>{service.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {service.duration}min - R$ {service.price}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Professional Search */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Profissional *
              </Label>
              {availableProfessionals.length === 1 ? (
                <Input
                  value={availableProfessionals[0]?.name || ''}
                  disabled
                  placeholder="Profissional selecionado automaticamente"
                />
              ) : (
                <Popover open={professionalSearchOpen} onOpenChange={setProfessionalSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      disabled={!selectedService || availableProfessionals.length === 0}
                    >
                      {selectedProfessional ? selectedProfessional.name : "Selecione um profissional..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar profissional..." />
                      <CommandEmpty>Nenhum profissional encontrado.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {availableProfessionals.map((professional) => (
                            <CommandItem
                              key={professional.id}
                              onSelect={() => handleProfessionalSelect(professional)}
                            >
                              <div className="flex flex-col">
                                <span>{professional.name}</span>
                                {professional.specialties && (
                                  <span className="text-sm text-muted-foreground">
                                    {professional.specialties.join(', ')}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Data *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.appointment_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.appointment_date
                      ? format(new Date(`${formData.appointment_date}T00:00:00`), 'dd/MM/yyyy')
                      : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.appointment_date ? new Date(`${formData.appointment_date}T00:00:00`) : undefined}
                    onSelect={(date) => handleInputChange('appointment_date', date ? format(date, 'yyyy-MM-dd') : '')}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário *
              </Label>
              {slots.length > 0 ? (
                <Select value={formData.appointment_time} onValueChange={(value) => handleInputChange('appointment_time', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {slots.map((slot) => (
                      <SelectItem key={slot.slot_time} value={slot.slot_time} disabled={!slot.is_available}>
                        {slot.slot_time} {!slot.is_available && '(Ocupado)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="time"
                  type="time"
                  value={formData.appointment_time}
                  onChange={(e) => handleInputChange('appointment_time', e.target.value)}
                  required
                />
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 60)}
                min="1"
                disabled={!!selectedService}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                min="0"
                disabled={!!selectedService}
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