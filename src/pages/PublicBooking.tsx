import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, ArrowLeft, Check, Scissors, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  category?: string;
}

interface TimeSlot {
  slot_time: string;
  is_available: boolean;
}

const PublicBooking = () => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Load active services
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('name');

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os serviços disponíveis.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  // Load available slots when date or service changes
  useEffect(() => {
    if (selectedDate && selectedService) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedService]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedService) return;

    setSlotsLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .rpc('get_available_slots', {
          p_user_id: 'public', // Will need to handle this for public bookings
          p_date: dateStr,
          p_service_duration: selectedService.duration,
          p_slot_interval: 30
        });

      if (error) throw error;
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      // For now, generate some mock slots
      generateMockSlots();
    } finally {
      setSlotsLoading(false);
    }
  };

  const generateMockSlots = () => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({
          slot_time: timeStr,
          is_available: Math.random() > 0.3 // 70% availability
        });
      }
    }
    setAvailableSlots(slots);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      // Create appointment
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: 'public-booking', // This will need proper handling
          client_name: formData.name,
          service_name: selectedService.name,
          service_id: selectedService.id,
          appointment_date: format(selectedDate, 'yyyy-MM-dd'),
          appointment_time: selectedTime,
          duration: selectedService.duration,
          price: selectedService.price,
          status: 'agendado',
          notes: `Agendamento online - Tel: ${formData.phone}, Email: ${formData.email}`
        });

      if (error) throw error;

      setStep(4);
      toast({
        title: "Agendamento realizado!",
        description: "Seu agendamento foi confirmado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar o agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setFormData({ name: '', phone: '', email: '' });
  };

  const canSelectDate = (date: Date) => {
    return !isBefore(date, startOfDay(new Date()));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/90">
      <div className="container max-w-4xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Agendar Serviço</h1>
          <p className="text-muted-foreground">
            Escolha o serviço desejado e agende seu horário em poucos passos
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= stepNumber
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={cn(
                    "w-12 h-px mx-2",
                    step > stepNumber ? "bg-primary" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scissors className="w-5 h-5" />
                Escolha o Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Carregando serviços...</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{service.name}</h3>
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-primary">
                            R$ {service.price.toFixed(2)}
                          </span>
                          <Badge variant="secondary">
                            {service.duration} min
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Date & Time Selection */}
        {step === 2 && selectedService && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Escolha Data e Horário
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(1)}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <span className="text-sm text-muted-foreground">
                  Serviço: {selectedService.name}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Selecione a Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP", { locale: ptBR }) : "Escolha uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => !canSelectDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <Label className="text-base font-medium mb-3 block">Horários Disponíveis</Label>
                  {slotsLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Carregando horários...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {availableSlots.filter(slot => slot.is_available).map((slot) => (
                        <Button
                          key={slot.slot_time}
                          variant="outline"
                          className="text-sm"
                          onClick={() => handleTimeSelect(slot.slot_time)}
                        >
                          {slot.slot_time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Client Information Form */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Seus Dados
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep(2)}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedDate && selectedTime && 
                    `${format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às ${selectedTime}`
                  }
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Digite seu nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">WhatsApp *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Confirmando..." : "Confirmar Agendamento"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <Card>
            <CardContent className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h2>
              <p className="text-muted-foreground mb-6">
                Seu agendamento foi realizado com sucesso. Entraremos em contato em breve para confirmar.
              </p>
              
              {selectedService && selectedDate && selectedTime && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                  <h3 className="font-semibold mb-2">Resumo do Agendamento:</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Serviço:</strong> {selectedService.name}</p>
                    <p><strong>Data:</strong> {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}</p>
                    <p><strong>Horário:</strong> {selectedTime}</p>
                    <p><strong>Duração:</strong> {selectedService.duration} minutos</p>
                    <p><strong>Valor:</strong> R$ {selectedService.price.toFixed(2)}</p>
                  </div>
                </div>
              )}

              <Button onClick={resetBooking} variant="outline">
                Fazer Novo Agendamento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PublicBooking;