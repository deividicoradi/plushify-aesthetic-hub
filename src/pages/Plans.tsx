import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Star, ArrowRight, Sparkles, Clock, AlertTriangle, TrendingUp, Shield, Users, Rocket, Gift, BadgePercent } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useToast } from '@/hooks/use-toast';

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { currentPlan, subscription, loading, checkSubscriptionStatus } = useSubscription();
  const { createCheckout, openCustomerPortal, loading: stripeLoading } = useStripeCheckout();
  const { toast } = useToast();

  // Check for success/cancel parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    const plan = urlParams.get('plan');
    const billing = urlParams.get('billing');

    if (success === 'true') {
      const billingText = billing === 'annual' ? 'anual' : 'mensal';
      toast({
        title: "Pagamento realizado com sucesso!",
        description: `Bem-vindo ao plano ${plan} ${billingText}! Verificando sua assinatura...`,
      });
      // Check subscription status after successful payment
      checkSubscriptionStatus();
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast, checkSubscriptionStatus]);

  const handlePlanSelection = async (planId: string) => {
    if (planId === 'trial') return;
    
    if (planId === 'professional' || planId === 'premium') {
      const billingPeriod = isAnnual ? 'annual' : 'monthly';
      await createCheckout(planId as 'professional' | 'premium', billingPeriod);
    }
  };

  const handleManageSubscription = async () => {
    await openCustomerPortal();
  };

  const plans = [
    {
      id: 'trial',
      name: 'Trial Gratuito',
      price: 'Gratuito',
      period: '',
      originalPrice: '',
      annualPrice: 'Gratuito',
      annualPeriod: '',
      annualOriginalPrice: '',
      description: 'Para teste da plataforma',
      subtitle: 'Funcionalidades limitadas',
      icon: Clock,
      features: [
        'Apenas 3 dias de teste',
        'Até 5 clientes',
        'Até 3 agendamentos',
        'Até 2 serviços',
        'Estoque básico (10 produtos)',
        'Sem relatórios avançados',
        'Sem backup automático'
      ],
      limitations: [
        'Acesso limitado a 3 dias',
        'Funcionalidades muito restritas',
        'Sem suporte técnico',
        'Dados removidos após trial'
      ],
      trial: true,
      current: currentPlan === 'trial'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 'R$ 89',
      period: '/mês',
      originalPrice: 'R$ 127',
      annualPrice: 'R$ 890',
      annualPeriod: '/ano',
      annualOriginalPrice: 'R$ 1.270',
      description: 'Para profissionais em crescimento',
      subtitle: 'Ideal para freelancers e pequenos negócios',
      icon: Zap,
      features: [
        'Acesso completo e ilimitado',
        'Clientes ilimitados',
        'Dashboard avançado',
        'Gestão financeira completa',
        'Sistema de parcelas',
        'Relatórios detalhados',
        'Gestão de estoque',
        'Alertas inteligentes',
        'Suporte prioritário'
      ],
      limitations: [],
      current: currentPlan === 'professional'
    },
    {
      id: 'premium',
      name: 'Enterprise',
      price: 'R$ 179',
      period: '/mês',
      originalPrice: 'R$ 249',
      annualPrice: 'R$ 1.790',
      annualPeriod: '/ano',
      annualOriginalPrice: 'R$ 2.490',
      description: 'RECOMENDADO - Para crescimento acelerado',
      subtitle: 'A escolha dos profissionais que faturam mais',
      icon: Crown,
      premium: true,
      mostComplete: true,
      features: [
        'TUDO do plano Professional',
        'Analytics avançados e IA',
        'Dashboard executivo premium',
        'Auditoria e logs de segurança',
        'Backup automático na nuvem',
        'Múltiplos usuários (até 10)',
        'Relatórios personalizados',
        'Exportação PDF/Excel',
        'Suporte VIP 24/7',
        'Consultoria mensal GRATUITA',
        'Integrações exclusivas',
        'API personalizada'
      ],
      bonuses: [
        'Setup personalizado GRÁTIS',
        'Treinamento VIP incluso',
        'Acesso a funcionalidades BETA',
        'Selo de cliente Premium'
      ],
      limitations: [],
      current: currentPlan === 'premium'
    }
  ];

  const testimonials = [
    {
      name: "Maria Silva",
      business: "Estúdio Beleza & Arte",
      text: "Com o plano Enterprise, aumentei meu faturamento em 150% em 6 meses!",
      plan: "Enterprise"
    },
    {
      name: "João Santos",
      business: "Clínica Renovar",
      text: "O dashboard executivo me dá insights que transformaram meu negócio.",
      plan: "Enterprise"
    }
  ];

  const faqs = [
    {
      question: 'Por que o plano Enterprise é o mais recomendado?',
      answer: 'O Enterprise oferece todas as ferramentas necessárias para escalar seu negócio: analytics avançados, múltiplos usuários, consultoria mensal e suporte VIP. É o investimento que mais gera retorno.'
    },
    {
      question: 'Como funciona a consultoria mensal gratuita?',
      answer: 'Clientes Enterprise recebem 1 hora de consultoria mensal com nossos especialistas para otimizar processos, aumentar vendas e crescer o negócio.'
    },
    {
      question: 'Posso mudar de plano a qualquer momento?',
      answer: 'Sim! Você pode fazer upgrade instantâneo. O downgrade acontece no próximo ciclo de cobrança.'
    },
    {
      question: 'O que acontece se eu cancelar?',
      answer: 'Sem pegadinhas! Você mantém acesso até o fim do período pago e pode reativar quando quiser.'
    }
  ];

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header */}
            <header className="flex items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-xl font-semibold">Planos</h1>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6 bg-background overflow-y-auto">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-6 py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium">
                    <Rocket className="w-4 h-4" />
                    Oferta Limitada - Apenas este mês!
                  </div>
                  <h1 className="text-4xl font-bold max-w-4xl mx-auto leading-tight">
                    Transforme Seu Negócio de <span className="text-primary">Estética</span>
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Mais de <span className="text-primary font-semibold">10.000+ profissionais</span> já escolheram nossa plataforma. 
                    Sistema completo que <span className="text-green-600 font-semibold">aumenta vendas em até 200%</span>.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-medium">Aumento médio de 150% no faturamento</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full border">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Garantia de 30 dias</span>
                    </div>
                  </div>
                </div>

                {/* Current Plan Alert */}
                {currentPlan === 'trial' && (
                  <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-8 h-8 text-orange-600 animate-bounce" />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200">Trial Expirando!</h3>
                          <p className="text-orange-700 dark:text-orange-300 mt-1">
                            Não perca seus dados! Escolha um plano agora e continue crescendo seu negócio.
                          </p>
                        </div>
                        <Button 
                          onClick={() => handlePlanSelection('premium')}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Upgrade Agora!
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manage Subscription Button for paid plans */}
                {(currentPlan === 'professional' || currentPlan === 'premium') && (
                  <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                              Plano {currentPlan === 'professional' ? 'Professional' : 'Enterprise'} Ativo
                            </h3>
                            <p className="text-green-700 dark:text-green-300">
                              Você está aproveitando todo o poder da nossa plataforma!
                            </p>
                          </div>
                        </div>
                        <Button 
                          onClick={handleManageSubscription}
                          disabled={stripeLoading}
                          variant="outline"
                          className="border-green-500 text-green-700 hover:bg-green-50"
                        >
                          {stripeLoading ? "Carregando..." : "Gerenciar Assinatura"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 py-4">
                  <span className={`text-lg font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Mensal
                  </span>
                  <Switch
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className={`text-lg font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Anual
                  </span>
                  {isAnnual && (
                    <Badge className="bg-green-500 text-white text-sm px-3 py-1">
                      Economize 30%
                    </Badge>
                  )}
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                  {plans.map((plan, index) => {
                    const currentPrice = isAnnual ? plan.annualPrice : plan.price;
                    const currentPeriod = isAnnual ? plan.annualPeriod : plan.period;
                    const currentOriginalPrice = isAnnual ? plan.annualOriginalPrice : plan.originalPrice;
                    const installmentPrice = isAnnual && plan.annualPrice !== 'Gratuito' 
                      ? `${Math.round(parseInt(plan.annualPrice.replace('R$ ', '').replace('.', '')) / 10)}`
                      : null;

                    const IconComponent = plan.icon;

                    return (
                      <Card 
                        key={plan.id} 
                        className={`relative transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] h-full flex flex-col ${
                          plan.mostComplete
                            ? 'border-2 border-primary shadow-xl bg-gradient-to-br from-background to-primary/5 scale-105 z-10' 
                            : plan.current 
                              ? plan.trial
                                ? 'border-2 border-orange-400 bg-gradient-to-br from-background to-orange-50/20 dark:to-orange-950/20' 
                                : 'border-2 border-green-400 bg-gradient-to-br from-background to-green-50/20 dark:to-green-950/20'
                              : 'border hover:border-primary/50'
                        }`}
                      >
                        {/* Top Badges */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-20">
                          {plan.mostComplete && (
                            <Badge className="bg-primary text-primary-foreground shadow-lg text-sm px-3 py-1 animate-pulse">
                              🔥 MAIS COMPLETO
                            </Badge>
                          )}
                          {plan.current && (
                            <Badge className={`${plan.trial ? 'bg-orange-500' : 'bg-green-500'} text-white shadow-lg`}>
                              {plan.trial ? 'Trial Ativo' : 'Plano Atual'}
                            </Badge>
                          )}
                        </div>

                        <CardHeader className="text-center space-y-4 pt-8 flex-shrink-0">
                          <div className={`w-28 h-28 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center p-6 ${plan.mostComplete ? 'animate-pulse' : ''}`}>
                            <IconComponent 
                              className={`${plan.mostComplete ? 'w-16 h-16' : 'w-14 h-14'} text-primary`} 
                              strokeWidth={1.5}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className={`${plan.mostComplete ? 'text-2xl' : 'text-xl'} font-bold`}>
                              {plan.name}
                            </h3>
                            <p className={`text-sm ${plan.mostComplete ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                              {plan.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {plan.subtitle}
                            </p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-baseline justify-center gap-1">
                              {currentOriginalPrice && (
                                <span className="text-lg text-muted-foreground line-through">{currentOriginalPrice}</span>
                              )}
                              <span className={`${plan.mostComplete ? 'text-4xl text-primary' : 'text-3xl'} font-bold`}>
                                {currentPrice}
                              </span>
                              {currentPeriod && <span className="text-muted-foreground">{currentPeriod}</span>}
                            </div>
                            {currentOriginalPrice && (
                              <div className={`text-sm font-semibold ${plan.mostComplete ? 'text-green-600 animate-pulse' : 'text-green-600'}`}>
                                Economize {Math.round((1 - parseInt(currentPrice.replace('R$ ', '').replace('.', '')) / parseInt(currentOriginalPrice.replace('R$ ', '').replace('.', ''))) * 100)}%
                              </div>
                            )}
                            {installmentPrice && (
                              <div className={`text-sm ${plan.mostComplete ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                ou 10x de R$ {installmentPrice} sem juros
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 px-6 flex-1">
                          {/* Features */}
                          <div className="space-y-3">
                            <h4 className={`font-semibold flex items-center gap-2 ${plan.mostComplete ? 'text-base' : 'text-sm'}`}>
                              <Star className={`${plan.mostComplete ? 'w-5 h-5 text-yellow-500' : 'w-4 h-4 text-green-500'}`} />
                              {plan.trial ? 'Limitações do Trial:' : 'Recursos inclusos:'}
                            </h4>
                            <ul className="space-y-2">
                              {plan.features.slice(0, 6).map((feature, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className={`w-4 h-4 rounded-full ${plan.mostComplete ? 'bg-primary' : 'bg-green-500'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Check className="w-2.5 h-2.5 text-white" />
                                  </div>
                                  <span className={`text-xs leading-relaxed ${plan.mostComplete ? 'font-medium' : ''}`}>
                                    {feature}
                                  </span>
                                </li>
                              ))}
                              {plan.features.length > 6 && (
                                <li className="text-xs text-muted-foreground italic">
                                  + {plan.features.length - 6} recursos adicionais
                                </li>
                              )}
                            </ul>
                          </div>

                          {/* Premium Bonuses */}
                          {plan.bonuses && (
                            <div className="space-y-3 pt-3 border-t border-border/50">
                              <h4 className="font-semibold text-primary text-sm flex items-center gap-2">
                                <Gift className="w-4 h-4" />
                                Bônus Exclusivos:
                              </h4>
                              <ul className="space-y-2">
                                {plan.bonuses.slice(0, 3).map((bonus, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                      <Gift className="w-2.5 h-2.5 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-primary">{bonus}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Limitations */}
                          {plan.limitations.length > 0 && (
                            <div className="space-y-3 pt-3 border-t border-border/50">
                              <h4 className="font-medium text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Limitações:
                              </h4>
                              <ul className="space-y-2">
                                {plan.limitations.slice(0, 3).map((limitation, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                    </div>
                                    <span className="text-xs text-red-600 dark:text-red-400">{limitation}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-4 px-6 pb-6 flex-shrink-0">
                          <div className="w-full space-y-3">
                            <Button 
                              className={`w-full h-14 text-base font-semibold transition-all duration-300 transform hover:scale-105 ${
                                plan.current 
                                  ? plan.trial
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white' 
                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                  : plan.mostComplete 
                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg animate-pulse' 
                                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                              }`}
                              disabled={(plan.current && !plan.trial) || stripeLoading}
                              onClick={() => handlePlanSelection(plan.id)}
                            >
                              {stripeLoading ? (
                                "Processando..."
                              ) : plan.current ? (
                                plan.trial ? (
                                  <div className="flex items-center justify-center gap-3">
                                    <Rocket className="w-5 h-5 flex-shrink-0" />
                                    <span>FAZER UPGRADE AGORA!</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-3">
                                    <Check className="w-5 h-5 flex-shrink-0" />
                                    <span>Plano Atual</span>
                                  </div>
                                )
                              ) : plan.mostComplete ? (
                                <div className="flex items-center justify-center gap-3">
                                  <Crown className="w-6 h-6 flex-shrink-0" />
                                  <span>ESCOLHER O MELHOR!</span>
                                  <ArrowRight className="w-5 h-5 flex-shrink-0" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-3">
                                  <span>Escolher {plan.name}</span>
                                  <ArrowRight className="w-5 h-5 flex-shrink-0" />
                                </div>
                              )}
                            </Button>
                            
                            {plan.mostComplete && (
                              <div className="text-center">
                                <p className="text-xs text-primary font-medium animate-pulse">
                                  Escolha de 89% dos nossos clientes de sucesso!
                                </p>
                              </div>
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>

                {/* Social Proof Section */}
                <Card className="bg-muted/30">
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <h2 className="text-2xl font-bold">
                        O que nossos clientes Enterprise estão dizendo
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {testimonials.map((testimonial, index) => (
                          <Card key={index} className="p-6">
                            <div className="space-y-4">
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                              <p className="italic">"{testimonial.text}"</p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{testimonial.name}</p>
                                  <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                                </div>
                                <Badge className="bg-primary text-primary-foreground">
                                  {testimonial.plan}
                                </Badge>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                <div className="space-y-6 py-6">
                  <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold">
                      Perguntas Frequentes
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      Tudo que você precisa saber para tomar a melhor decisão
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {faqs.map((faq, index) => (
                      <Card key={index} className="hover:shadow-md transition-all duration-300 p-6">
                        <CardContent className="p-0">
                          <h3 className="font-semibold mb-3 text-base leading-relaxed">
                            {faq.question}
                          </h3>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Final CTA Section */}
                <Card className="text-center bg-primary text-primary-foreground">
                  <CardContent className="p-10 space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center">
                      <Crown className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="space-y-3">
                      <h2 className="text-3xl font-bold">
                        Pronto para revolucionar seu negócio?
                      </h2>
                      <p className="text-lg opacity-90 max-w-2xl mx-auto">
                        Junte-se aos milhares de profissionais que já transformaram seus negócios com nossa plataforma. 
                        <span className="font-semibold">O sucesso está a um clique de distância!</span>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button 
                        size="lg" 
                        onClick={() => handlePlanSelection('premium')}
                        className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold text-lg px-6 py-3 shadow-lg transform hover:scale-105 transition-all h-14"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <Crown className="w-6 h-6 flex-shrink-0" />
                          <span>Começar com Enterprise</span>
                          <ArrowRight className="w-5 h-5 flex-shrink-0" />
                        </div>
                      </Button>
                      <div className="text-sm opacity-75">
                        Sem compromisso • Cancele quando quiser • Suporte 24/7
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Plans;
