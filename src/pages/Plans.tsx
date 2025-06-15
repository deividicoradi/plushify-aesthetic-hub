
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
      description: 'Apenas para testes',
      subtitle: 'Funcionalidades limitadas',
      icon: Clock,
      gradient: 'from-gray-400 to-gray-500',
      features: [
        '⏰ Apenas 3 dias de teste',
        '👥 Até 5 clientes',
        '📅 Até 3 agendamentos',
        '🔧 Até 2 serviços',
        '📦 Estoque básico (10 produtos)',
        '❌ Sem relatórios',
        '❌ Sem backup'
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
      description: 'Para profissionais que querem crescer',
      subtitle: 'Ideal para freelancers e pequenos negócios',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      popular: false,
      features: [
        '🚀 Acesso completo e ilimitado',
        '👥 Clientes ilimitados',
        '📊 Dashboard avançado',
        '💰 Gestão financeira completa',
        '💳 Sistema de parcelas',
        '📈 Relatórios detalhados',
        '📦 Gestão de estoque',
        '🔔 Alertas inteligentes',
        '📞 Suporte prioritário'
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
      description: '🔥 RECOMENDADO - Para crescimento acelerado',
      subtitle: 'A escolha dos profissionais que faturam mais',
      icon: Crown,
      gradient: 'from-purple-600 via-pink-600 to-yellow-500',
      premium: true,
      mostComplete: true,
      features: [
        '⭐ TUDO do plano Professional',
        '🎯 Analytics avançados e IA',
        '👑 Dashboard executivo premium',
        '🔒 Auditoria e logs de segurança',
        '☁️ Backup automático na nuvem',
        '👥 Múltiplos usuários (até 10)',
        '📋 Relatórios personalizados',
        '📄 Exportação PDF/Excel',
        '🚀 Suporte VIP 24/7',
        '💼 Consultoria mensal GRATUITA',
        '🔌 Integrações exclusivas',
        '⚡ API personalizada'
      ],
      bonuses: [
        '🎁 Setup personalizado GRÁTIS',
        '📚 Treinamento VIP incluso',
        '💎 Acesso a funcionalidades BETA',
        '🏆 Selo de cliente Premium'
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
            <header className="flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 sticky top-0 z-50">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-foreground">Planos</h1>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-6 bg-gradient-to-br from-background via-primary/5 to-purple/5 overflow-y-auto">
              <div className="max-w-7xl mx-auto space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-8 py-12">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium animate-pulse">
                    <Rocket className="w-5 h-5" />
                    🔥 OFERTA LIMITADA - Apenas este mês!
                  </div>
                  <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight">
                    Transforme Seu Negócio de Estética
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Mais de <span className="text-purple-600 font-bold">10.000+ profissionais</span> já escolheram nossa plataforma. 
                    Sistema completo que <span className="text-green-600 font-bold">aumenta vendas em até 200%</span>.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <div className="flex items-center gap-2 px-6 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">Aumento médio de 150% no faturamento</span>
                    </div>
                    <div className="flex items-center gap-2 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold">Garantia de 30 dias</span>
                    </div>
                  </div>
                </div>

                {/* Current Plan Alert */}
                {currentPlan === 'trial' && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-300 dark:border-orange-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-4">
                      <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400 animate-bounce" />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200">⚠️ Trial Expirando!</h3>
                        <p className="text-orange-700 dark:text-orange-300 mt-1">
                          Não perca seus dados! Escolha um plano agora e continue crescendo seu negócio.
                        </p>
                      </div>
                      <Button 
                        onClick={() => handlePlanSelection('premium')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                      >
                        Upgrade Agora!
                      </Button>
                    </div>
                  </div>
                )}

                {/* Manage Subscription Button for paid plans */}
                {(currentPlan === 'professional' || currentPlan === 'premium') && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                            ✅ Plano {currentPlan === 'professional' ? 'Professional' : 'Enterprise'} Ativo
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
                        className="border-green-500 text-green-700 hover:bg-green-50 shadow-md"
                      >
                        {stripeLoading ? "Carregando..." : "Gerenciar Assinatura"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-6 py-6">
                  <span className={`text-lg font-semibold transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    💳 Mensal
                  </span>
                  <div className="relative">
                    <Switch
                      checked={isAnnual}
                      onCheckedChange={setIsAnnual}
                      className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500 scale-125"
                    />
                  </div>
                  <span className={`text-lg font-semibold transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    💰 Anual
                  </span>
                  {isAnnual && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-4 py-2 animate-pulse shadow-lg">
                      💸 ECONOMIZE 30% + Parcele em 10x
                    </Badge>
                  )}
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
                  {/* Premium Plan Highlight Background */}
                  <div className="absolute inset-0 lg:left-[66.666%] lg:right-0 bg-gradient-to-br from-purple-100/50 via-pink-100/50 to-yellow-100/50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-yellow-900/20 rounded-3xl -z-10 lg:transform lg:scale-105"></div>
                  
                  {plans.map((plan, index) => {
                    const currentPrice = isAnnual ? plan.annualPrice : plan.price;
                    const currentPeriod = isAnnual ? plan.annualPeriod : plan.period;
                    const currentOriginalPrice = isAnnual ? plan.annualOriginalPrice : plan.originalPrice;
                    const installmentPrice = isAnnual && plan.annualPrice !== 'Gratuito' 
                      ? `${Math.round(parseInt(plan.annualPrice.replace('R$ ', '').replace('.', '')) / 10)}`
                      : null;

                    return (
                      <Card 
                        key={plan.id} 
                        className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl transform hover:scale-105 ${
                          plan.mostComplete
                            ? 'border-4 border-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 shadow-2xl bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-950/30 dark:to-pink-950/30 lg:scale-110 z-10' 
                            : plan.premium 
                              ? 'border-3 border-purple-400 shadow-xl bg-gradient-to-br from-background to-purple-50/20 dark:to-purple-950/20' 
                              : plan.current 
                                ? plan.trial
                                  ? 'border-2 border-orange-400 bg-gradient-to-br from-background to-orange-50/20 dark:to-orange-950/20' 
                                  : 'border-2 border-green-400 bg-gradient-to-br from-background to-green-50/20 dark:to-green-950/20'
                                : 'border border-border hover:border-primary/50 bg-background'
                        }`}
                      >
                        {/* Premium Glow Effect */}
                        {plan.mostComplete && (
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-yellow-500/20 animate-pulse"></div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-20">
                          {plan.mostComplete && (
                            <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 text-white shadow-lg text-sm px-4 py-2 animate-bounce">
                              🔥 MAIS COMPLETO - RECOMENDADO
                            </Badge>
                          )}
                          {plan.popular && (
                            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                              ⭐ Popular
                            </Badge>
                          )}
                          {plan.current && (
                            <Badge className={`${plan.trial ? 'bg-orange-500' : 'bg-green-500'} text-white shadow-lg`}>
                              {plan.trial ? '⏱️ Trial Ativo' : '✅ Plano Atual'}
                            </Badge>
                          )}
                        </div>

                        <CardHeader className="text-center space-y-6 pt-12 relative z-10">
                          <div className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-2xl ${plan.mostComplete ? 'animate-pulse' : ''}`}>
                            <plan.icon className={`${plan.mostComplete ? 'w-14 h-14' : 'w-12 h-12'} text-white`} />
                          </div>
                          
                          <div className="space-y-3">
                            <h3 className={`${plan.mostComplete ? 'text-3xl' : 'text-2xl'} font-bold text-foreground`}>
                              {plan.name}
                            </h3>
                            <p className={`${plan.mostComplete ? 'text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : 'text-muted-foreground'}`}>
                              {plan.description}
                            </p>
                            <p className="text-sm text-muted-foreground italic">
                              {plan.subtitle}
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-baseline justify-center gap-2">
                              {currentOriginalPrice && (
                                <span className="text-xl text-muted-foreground line-through">{currentOriginalPrice}</span>
                              )}
                              <span className={`${plan.mostComplete ? 'text-6xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : 'text-5xl text-foreground'} font-bold`}>
                                {currentPrice}
                              </span>
                              {currentPeriod && <span className="text-muted-foreground text-lg">{currentPeriod}</span>}
                            </div>
                            {currentOriginalPrice && (
                              <div className={`text-sm font-bold ${plan.mostComplete ? 'text-green-600 text-lg animate-pulse' : 'text-green-600'}`}>
                                💰 Economize {Math.round((1 - parseInt(currentPrice.replace('R$ ', '').replace('.', '')) / parseInt(currentOriginalPrice.replace('R$ ', '').replace('.', ''))) * 100)}%
                              </div>
                            )}
                            {installmentPrice && (
                              <div className={`text-sm ${plan.mostComplete ? 'text-purple-600 font-semibold' : 'text-muted-foreground'}`}>
                                ou 10x de R$ {installmentPrice} sem juros
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-6 px-6 relative z-10">
                          {/* Features */}
                          <div className="space-y-4">
                            <h4 className={`font-bold text-foreground flex items-center gap-2 ${plan.mostComplete ? 'text-lg' : ''}`}>
                              <Star className={`${plan.mostComplete ? 'w-6 h-6 text-yellow-500' : 'w-5 h-5 text-green-500'}`} />
                              {plan.trial ? '⚠️ Limitações do Trial:' : '✨ Recursos inclusos:'}
                            </h4>
                            <ul className="space-y-3">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className={`w-6 h-6 rounded-full ${plan.mostComplete ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-green-500'} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                  <span className={`text-sm leading-relaxed ${plan.mostComplete ? 'font-medium' : ''}`}>
                                    {feature}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Premium Bonuses */}
                          {plan.bonuses && (
                            <div className="space-y-4 pt-4 border-t-2 border-gradient-to-r from-purple-500 to-pink-500">
                              <h4 className="font-bold text-purple-600 dark:text-purple-400 text-lg flex items-center gap-2">
                                <Gift className="w-6 h-6" />
                                🎁 Bônus Exclusivos:
                              </h4>
                              <ul className="space-y-3">
                                {plan.bonuses.map((bonus, index) => (
                                  <li key={index} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                                      <Gift className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{bonus}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Limitations */}
                          {plan.limitations.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-border/50">
                              <h4 className="font-semibold text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                ⚠️ Limitações:
                              </h4>
                              <ul className="space-y-2">
                                {plan.limitations.map((limitation, index) => (
                                  <li key={index} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-red-600 dark:text-red-400">{limitation}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-6 px-6 pb-6 relative z-10">
                          <Button 
                            className={`w-full h-14 text-lg font-bold transition-all duration-300 transform hover:scale-105 ${
                              plan.current 
                                ? plan.trial
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg' 
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                                : plan.mostComplete 
                                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600 text-white shadow-2xl hover:shadow-3xl animate-pulse' 
                                  : plan.premium
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg'
                                    : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md'
                            }`}
                            disabled={(plan.current && !plan.trial) || stripeLoading}
                            onClick={() => handlePlanSelection(plan.id)}
                          >
                            {stripeLoading ? (
                              "Processando..."
                            ) : plan.current ? (
                              plan.trial ? (
                                <>
                                  <Rocket className="w-5 h-5 mr-2" />
                                  🚀 FAZER UPGRADE AGORA!
                                </>
                              ) : (
                                <>
                                  <Check className="w-5 h-5 mr-2" />
                                  ✅ Plano Atual
                                </>
                              )
                            ) : plan.mostComplete ? (
                              <>
                                <Crown className="w-6 h-6 mr-2" />
                                👑 ESCOLHER O MELHOR!
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </>
                            ) : (
                              <>
                                Escolher {plan.name}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                          
                          {plan.mostComplete && (
                            <div className="text-center mt-3">
                              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold animate-pulse">
                                🔥 Escolha de 89% dos nossos clientes de sucesso!
                              </p>
                            </div>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>

                {/* Social Proof Section */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl p-8 border border-purple-200 dark:border-purple-800">
                  <div className="text-center space-y-6">
                    <h2 className="text-3xl font-bold text-foreground">
                      🏆 O que nossos clientes Enterprise estão dizendo
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      {testimonials.map((testimonial, index) => (
                        <Card key={index} className="p-6 bg-white/50 dark:bg-gray-900/50 border-purple-200 dark:border-purple-800">
                          <div className="space-y-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 italic">"{testimonial.text}"</p>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-foreground">{testimonial.name}</p>
                                <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                              </div>
                              <Badge className="bg-purple-500 text-white">
                                {testimonial.plan}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-8 py-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-4xl font-bold text-foreground">
                      💬 Perguntas Frequentes
                    </h2>
                    <p className="text-xl text-muted-foreground">
                      Tudo que você precisa saber para tomar a melhor decisão
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {faqs.map((faq, index) => (
                      <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border/50 p-6">
                        <CardContent className="p-0">
                          <h3 className="font-bold text-foreground mb-4 text-lg leading-relaxed">
                            {faq.question}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Final CTA Section */}
                <div className="text-center bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 rounded-3xl p-12 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative z-10 space-y-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <Crown className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold">
                        🚀 Pronto para revolucionar seu negócio?
                      </h2>
                      <p className="text-xl opacity-90 max-w-2xl mx-auto">
                        Junte-se aos milhares de profissionais que já transformaram seus negócios com nossa plataforma. 
                        <span className="font-bold">O sucesso está a um clique de distância!</span>
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button 
                        size="lg" 
                        onClick={() => handlePlanSelection('premium')}
                        className="bg-white text-purple-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 shadow-2xl transform hover:scale-105 transition-all"
                      >
                        <Crown className="w-6 h-6 mr-2" />
                        Começar com Enterprise
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <div className="text-sm opacity-75">
                        ✅ Sem compromisso • ✅ Cancele quando quiser • ✅ Suporte 24/7
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Plans;
