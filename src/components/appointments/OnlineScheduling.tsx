import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, User, Scissors } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useAppointments } from '@/hooks/useAppointments';
import { useServices } from '@/hooks/useServices';
import { toast } from '@/hooks/use-toast';

interface OnlineSchedulingProps {
  clientName?: string;
  clientId?: string;
  onScheduled?: () => void;
}

export const OnlineScheduling = ({ clientName, clientId, onScheduled }: OnlineSchedulingProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);

  const { slots, isLoading, fetchAvailableSlots } = useAvailableSlots();
  const { createAppointment } = useAppointments();
  const { services } = useServices();

  const selectedServiceData = services.find(s => s.id === selectedService);

  useEffect(() => {
    if (selectedDate && selectedServiceData) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      fetchAvailableSlots(dateStr, selectedServiceData.duration);
    }
  }, [selectedDate, selectedServiceData, fetchAvailableSlots]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isBefore(date, startOfDay(new Date()))) {
      setSelectedDate(date);
      setSelectedTime(''); // Reset selected time when date changes
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !selectedService || !clientName) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);

    try {
      const appointmentData = {
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        client_id: clientId || null,
        client_name: clientName,
        service_id: selectedService,
        service_name: selectedServiceData?.name || '',
        duration: selectedServiceData?.duration || 60,
        price: selectedServiceData?.price || 0,
        status: 'agendado' as const,
        notes: ''
      };

      const result = await createAppointment(appointmentData);
      
      if (result) {
        toast({
          title: "Sucesso!",
          description: "Agendamento realizado com sucesso!"
        });
        
        // Reset form
        setSelectedDate(undefined);
        setSelectedTime('');
        setSelectedService('');
        
        onScheduled?.();
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível realizar o agendamento.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const availableSlots = slots.filter(slot => slot.is_available);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Agendamento Online
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Serviço
            </label>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.filter(s => s.active).map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{service.name}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="secondary">{service.duration}min</Badge>
                        <Badge variant="outline">R$ {service.price.toFixed(2)}</Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Info */}
          {clientName && (
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente
              </label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="font-medium">{clientName}</span>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Escolha a Data</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => isBefore(date, startOfDay(new Date()))}
                locale={ptBR}
                className="rounded-md border"
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários Disponíveis
              </h3>
              
              {selectedDate && selectedService ? (
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-muted-foreground">
                        Carregando horários...
                      </div>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map(slot => (
                        <Button
                          key={slot.slot_time}
                          variant={selectedTime === slot.slot_time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(slot.slot_time)}
                          className="text-sm"
                        >
                          {slot.slot_time.slice(0, 5)}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-sm text-muted-foreground">
                        Nenhum horário disponível para esta data
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-muted-foreground">
                    Selecione um serviço e uma data para ver os horários
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary */}
          {selectedDate && selectedTime && selectedService && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-3">Resumo do Agendamento</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Serviço:</span>
                    <span className="font-medium">{selectedServiceData?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data:</span>
                    <span className="font-medium">
                      {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Horário:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duração:</span>
                    <span className="font-medium">{selectedServiceData?.duration} minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span className="font-medium">R$ {selectedServiceData?.price.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Book Button */}
          <Button
            onClick={handleBookAppointment}
            disabled={!selectedDate || !selectedTime || !selectedService || !clientName || isBooking}
            className="w-full"
            size="lg"
          >
            {isBooking ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};