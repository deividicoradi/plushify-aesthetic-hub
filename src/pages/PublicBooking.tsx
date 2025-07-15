import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, CheckCircle, ArrowLeft, ArrowRight, Star, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface TimeSlot {
  slot_time: string;
  is_available: boolean;
}

interface BookingData {
  service?: Service;
  date?: string;
  time?: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export default function PublicBooking() {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingData>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  // Gerar próximos 14 dias úteis
  useEffect(() => {
    const dates = [];
    const today = startOfDay(new Date());
    
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      // Pular domingos (0) 
      if (dayOfWeek !== 0) {
        dates.push(format(date, 'yyyy-MM-dd'));
      }
    }
    
    setSelectedDates(dates);
  }, []);

  // Buscar serviços públicos usando a nova função
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_services');
        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os serviços.",
          variant: "destructive"
        });
      }
    };

    fetchServices();
  }, []);

  // Buscar horários disponíveis usando a nova função
  const fetchAvailableSlots = async (serviceId: string, date: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_public_available_slots', {
        p_service_id: serviceId,
        p_date: date
      });
      
      if (error) throw error;
      
      setAvailableSlots(data || []);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os horários disponíveis.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Confirmar agendamento usando a nova função
  const confirmBooking = async () => {
    if (!booking.service || !booking.date || !booking.time) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validação de campos
    if (!booking.name.trim() || !booking.phone.trim() || !booking.email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(booking.email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('create_public_booking', {
        p_client_name: booking.name.trim(),
        p_client_email: booking.email.trim(),
        p_client_phone: booking.phone.trim(),
        p_service_id: booking.service.id,
        p_appointment_date: booking.date,
        p_appointment_time: booking.time,
        p_notes: booking.notes?.trim() || null
      });

      if (error) throw error;

      setAppointmentId(data);
      setStep(5);
      
      toast({
        title: "Sucesso!",
        description: "Seu agendamento foi confirmado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao confirmar agendamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível confirmar o agendamento.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd 'de' MMMM", { locale: ptBR });
  };

  const formatWeekday = (dateStr: string) => {
    return format(new Date(dateStr), 'EEEE', { locale: ptBR });
  };

  const resetBooking = () => {
    setStep(1);
    setBooking({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
    setAppointmentId(null);
    setAvailableSlots([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Plushify</h1>
                <p className="text-xs text-muted-foreground">Agendamento Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      step >= i ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                {step}/4
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Etapa 1: Seleção de Serviço */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-primary" />
                  Escolha seu serviço
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione o serviço que deseja agendar
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Carregando serviços...</p>
                  </div>
                ) : (
                  services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                        booking.service?.id === service.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setBooking(prev => ({ ...prev, service }))}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <Badge variant="secondary">{formatPrice(service.price)}</Badge>
                      </div>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                      )}
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration} min
                      </div>
                    </div>
                  ))
                )}
                
                <Button
                  onClick={() => setStep(2)}
                  disabled={!booking.service}
                  className="w-full"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Etapa 2: Seleção de Data */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    Escolha a data
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Serviço: {booking.service?.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {selectedDates.map((date) => (
                    <div
                      key={date}
                      className={`p-3 border rounded-lg cursor-pointer text-center transition-all hover:border-primary ${
                        booking.date === date ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => setBooking(prev => ({ ...prev, date }))}
                    >
                      <div className="text-sm font-medium capitalize">
                        {formatWeekday(date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(date)}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    if (booking.service && booking.date) {
                      fetchAvailableSlots(booking.service.id, booking.date);
                      setStep(3);
                    }
                  }}
                  disabled={!booking.date}
                  className="w-full"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Etapa 3: Seleção de Horário */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-primary" />
                    Escolha o horário
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(2)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking.date && format(new Date(booking.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Carregando horários...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots
                        .filter(slot => slot.is_available)
                        .map((slot) => (
                          <div
                            key={slot.slot_time}
                            className={`p-2 border rounded-lg cursor-pointer text-center transition-all hover:border-primary ${
                              booking.time === slot.slot_time ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                            onClick={() => setBooking(prev => ({ ...prev, time: slot.slot_time }))}
                          >
                            <div className="text-sm font-medium">
                              {formatTime(slot.slot_time)}
                            </div>
                          </div>
                        ))}
                    </div>

                    {availableSlots.filter(slot => slot.is_available).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum horário disponível para esta data</p>
                      </div>
                    )}

                    <Button
                      onClick={() => setStep(4)}
                      disabled={!booking.time}
                      className="w-full"
                    >
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Etapa 4: Dados do Cliente */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2 text-primary" />
                    Seus dados
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(3)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumo do agendamento */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Resumo do agendamento</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Serviço:</strong> {booking.service?.name}</p>
                    <p><strong>Data:</strong> {booking.date && format(new Date(booking.date), "dd/MM/yyyy")}</p>
                    <p><strong>Horário:</strong> {booking.time && formatTime(booking.time)}</p>
                    <p><strong>Duração:</strong> {booking.service?.duration} min</p>
                    <p><strong>Valor:</strong> {booking.service && formatPrice(booking.service.price)}</p>
                  </div>
                </div>

                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={booking.name}
                      onChange={(e) => setBooking(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">WhatsApp *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={booking.phone}
                      onChange={(e) => setBooking(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={booking.email}
                      onChange={(e) => setBooking(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={booking.notes}
                      onChange={(e) => setBooking(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Alguma observação especial..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  onClick={confirmBooking}
                  disabled={!booking.name || !booking.phone || !booking.email || loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Confirmar agendamento
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Etapa 5: Confirmação */}
          {step === 5 && (
            <Card>
              <CardContent className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-xl font-bold mb-2">Agendamento confirmado!</h2>
                <p className="text-muted-foreground mb-6">
                  Seu agendamento foi registrado com sucesso. Entraremos em contato em breve para confirmar.
                </p>

                <div className="bg-muted/30 p-4 rounded-lg text-left mb-6">
                  <h3 className="font-semibold mb-2">Detalhes do agendamento</h3>
                  <div className="space-y-1 text-sm">
                    {appointmentId && <p><strong>Código:</strong> {appointmentId.slice(0, 8)}</p>}
                    <p><strong>Serviço:</strong> {booking.service?.name}</p>
                    <p><strong>Data:</strong> {booking.date && format(new Date(booking.date), "dd/MM/yyyy")}</p>
                    <p><strong>Horário:</strong> {booking.time && formatTime(booking.time)}</p>
                    <p><strong>Cliente:</strong> {booking.name}</p>
                    <p><strong>WhatsApp:</strong> {booking.phone}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Guarde este código para consultas futuras
                  </p>
                  <Button
                    onClick={resetBooking}
                    variant="outline"
                    className="w-full"
                  >
                    Fazer novo agendamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}