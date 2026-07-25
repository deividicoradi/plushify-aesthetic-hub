import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, CheckCircle, ArrowLeft, ArrowRight, Star, Heart, Sparkles, Home, Scissors, Phone, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, addDays, startOfDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Link, useParams } from "react-router-dom";

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
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);
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

  // Buscar serviços públicos do salão indicado no link. O slug é opaco —
  // resolvido pro profissional certo só dentro da RPC, nunca expõe o
  // user_id interno pro cliente.
  useEffect(() => {
    if (!slug) {
      setServicesLoaded(true);
      return;
    }

    const fetchServices = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_services', { p_slug: slug });
        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error('Erro ao buscar serviços:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os serviços.",
          variant: "destructive"
        });
      } finally {
        setServicesLoaded(true);
      }
    };

    fetchServices();
  }, [slug]);

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

  // parseISO (não new Date) trata "yyyy-MM-dd" como data local, não UTC —
  // new Date() faria a data "voltar" um dia em fusos negativos (ex: Brasil)
  // ao formatar, dessincronizando o rótulo exibido da data enviada à RPC.
  const formatWeekday = (dateStr: string) => {
    return format(parseISO(dateStr), 'EEEE', { locale: ptBR });
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

  if (!slug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full rounded-3xl border-border/60 shadow-xl shadow-black/5 bg-card">
          <CardContent className="text-center py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-lg font-bold mb-2">Link de agendamento inválido</h2>
            <p className="text-sm text-muted-foreground">
              Peça ao profissional o link correto de agendamento.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPct = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-[#9c3d70] pb-20 pt-6">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/10 blur-3xl rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-9 w-9 p-0 text-white hover:bg-white/15 hover:text-white"
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                <span className="sr-only">Início</span>
              </Link>
            </Button>
            <div className="text-white [&_button]:text-white [&_button]:hover:bg-white/15">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/20">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-xl font-bold text-white">Plushify — Agendamento Online</h1>
                <Sparkles className="w-4 h-4 text-white/80 animate-pulse" />
              </div>
              <p className="text-sm text-white/70 mt-0.5">Reserve seu horário em poucos passos</p>
            </div>
          </div>

          {step <= 4 && (
            <div className="max-w-md mx-auto mt-7">
              <div className="flex items-center justify-between text-xs font-medium text-white/70 mb-1.5">
                <span>Etapa {step} de 4</span>
                <span>{Math.round(progressPct)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 -mt-12 pb-10">
        <div className="max-w-md mx-auto">
          {/* Etapa 1: Seleção de Serviço */}
          {step === 1 && (
            <Card className="rounded-3xl border-border/60 shadow-xl shadow-black/5 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                    <Star className="w-5 h-5" />
                  </span>
                  Escolha seu serviço
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Selecione o serviço que deseja agendar
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {!servicesLoaded ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">Carregando serviços...</p>
                  </div>
                ) : services.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum serviço disponível para agendamento neste link.</p>
                  </div>
                ) : (
                  services.map((service) => {
                    const isSelected = booking.service?.id === service.id;
                    return (
                      <div
                        key={service.id}
                        className={`flex gap-3 p-4 border rounded-2xl cursor-pointer transition-all hover:border-primary/60 hover:shadow-sm ${
                          isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border'
                        }`}
                        onClick={() => setBooking(prev => ({ ...prev, service }))}
                      >
                        <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                          <Scissors className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <h3 className="font-semibold truncate">{service.name}</h3>
                            <Badge variant="secondary" className="rounded-full shrink-0">{formatPrice(service.price)}</Badge>
                          </div>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{service.description}</p>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {service.duration} min
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <Button
                  onClick={() => setStep(2)}
                  disabled={!booking.service}
                  className="w-full rounded-xl"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Etapa 2: Seleção de Data */}
          {step === 2 && (
            <Card className="rounded-3xl border-border/60 shadow-xl shadow-black/5 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                      <Calendar className="w-5 h-5" />
                    </span>
                    Escolha a data
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                    className="rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Serviço: {booking.service?.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {selectedDates.map((date) => {
                    const isSelected = booking.date === date;
                    return (
                      <button
                        type="button"
                        key={date}
                        className={`p-3 border rounded-2xl cursor-pointer text-center transition-all hover:border-primary/60 hover:shadow-sm ${
                          isSelected ? 'border-primary bg-primary shadow-sm' : 'border-border'
                        }`}
                        onClick={() => setBooking(prev => ({ ...prev, date }))}
                      >
                        <div className={`text-[11px] uppercase tracking-wide font-medium ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {formatWeekday(date).slice(0, 3)}
                        </div>
                        <div className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-foreground'}`}>
                          {format(parseISO(date), 'dd')}
                        </div>
                        <div className={`text-[11px] ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {format(parseISO(date), 'MMM', { locale: ptBR })}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => {
                    if (booking.service && booking.date) {
                      fetchAvailableSlots(booking.service.id, booking.date);
                      setStep(3);
                    }
                  }}
                  disabled={!booking.date}
                  className="w-full rounded-xl"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Etapa 3: Seleção de Horário */}
          {step === 3 && (
            <Card className="rounded-3xl border-border/60 shadow-xl shadow-black/5 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                      <Clock className="w-5 h-5" />
                    </span>
                    Escolha o horário
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(2)}
                    className="rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking.date && format(parseISO(booking.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
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
                    <div className="flex flex-wrap gap-2">
                      {availableSlots
                        .filter(slot => slot.is_available)
                        .map((slot) => {
                          const isSelected = booking.time === slot.slot_time;
                          return (
                            <button
                              type="button"
                              key={slot.slot_time}
                              className={`px-4 py-2 border rounded-full cursor-pointer text-center transition-all hover:border-primary/60 hover:shadow-sm ${
                                isSelected ? 'border-primary bg-primary text-white shadow-sm' : 'border-border'
                              }`}
                              onClick={() => setBooking(prev => ({ ...prev, time: slot.slot_time }))}
                            >
                              <div className="text-sm font-medium">
                                {formatTime(slot.slot_time)}
                              </div>
                            </button>
                          );
                        })}
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
                      className="w-full rounded-xl"
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
            <Card className="rounded-3xl border-border/60 shadow-xl shadow-black/5 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 text-primary">
                      <User className="w-5 h-5" />
                    </span>
                    Seus dados
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(3)}
                    className="rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Resumo do agendamento */}
                <div className="bg-gradient-to-br from-primary/10 via-muted/30 to-transparent border border-primary/15 p-4 rounded-2xl">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-primary" />
                    {booking.service?.name}
                  </h3>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {booking.date && format(parseISO(booking.date), "dd/MM/yyyy")} às {booking.time && formatTime(booking.time)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {booking.service?.duration} min
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-dashed border-primary/20 flex items-center justify-between">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-lg font-bold text-primary">
                      {booking.service && formatPrice(booking.service.price)}
                    </span>
                  </div>
                </div>

                {/* Formulário */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5" /> Nome completo *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={booking.name}
                      onChange={(e) => setBooking(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Seu nome completo"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-1.5 mb-1.5">
                      <Phone className="w-3.5 h-3.5" /> WhatsApp *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={booking.phone}
                      onChange={(e) => setBooking(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="flex items-center gap-1.5 mb-1.5">
                      <Mail className="w-3.5 h-3.5" /> E-mail *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={booking.email}
                      onChange={(e) => setBooking(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes" className="flex items-center gap-1.5 mb-1.5">
                      <MessageSquare className="w-3.5 h-3.5" /> Observações (opcional)
                    </Label>
                    <Textarea
                      id="notes"
                      value={booking.notes}
                      onChange={(e) => setBooking(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Alguma observação especial..."
                      className="rounded-xl"
                      rows={3}
                    />
                  </div>
                </div>

                <Button
                  onClick={confirmBooking}
                  disabled={!booking.name || !booking.phone || !booking.email || loading}
                  className="w-full rounded-xl"
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
            <Card className="rounded-3xl border-border/60 shadow-xl shadow-black/5 bg-card overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent pt-10 pb-8 px-6 text-center relative">
                <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" />
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-500/10">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">Agendamento confirmado!</h2>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Entraremos em contato em breve para confirmar os detalhes.
                </p>
              </div>

              <CardContent className="pt-6 pb-8">
                <div className="border border-border/60 rounded-2xl overflow-hidden mb-6">
                  {appointmentId && (
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/60">
                      <span className="text-xs text-muted-foreground">Código</span>
                      <span className="text-sm font-mono font-semibold tracking-wide">{appointmentId.slice(0, 8).toUpperCase()}</span>
                    </div>
                  )}
                  <div className="divide-y divide-border/60 text-sm">
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground flex items-center gap-2"><Scissors className="w-3.5 h-3.5" /> Serviço</span>
                      <span className="font-medium">{booking.service?.name}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Data</span>
                      <span className="font-medium">{booking.date && format(parseISO(booking.date), "dd/MM/yyyy")} às {booking.time && formatTime(booking.time)}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground flex items-center gap-2"><User className="w-3.5 h-3.5" /> Cliente</span>
                      <span className="font-medium">{booking.name}</span>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-muted-foreground flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> WhatsApp</span>
                      <span className="font-medium">{booking.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground">
                    Guarde este código para consultas futuras
                  </p>
                  <Button
                    onClick={resetBooking}
                    variant="outline"
                    className="w-full rounded-xl"
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