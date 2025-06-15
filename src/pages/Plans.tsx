
import React, { useState } from 'react';
import { Check, Crown, Zap, Star, ArrowRight, Sparkles } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Starter',
      price: 'Gratuito',
      period: '',
      originalPrice: '',
      annualPrice: 'Gratuito',
      annualPeriod: '',
      annualOriginalPrice: '',
      description: 'Perfeito para começar',
      icon: Star,
      gradient: 'from-gray-500 to-gray-600',
      features: [
        'Dashboard com métricas básicas',
        'Gestão de clientes (até 50)',
        'Agendamentos simples',
        'Controle de serviços básico',
        'Estoque básico (até 100 produtos)',
        'Anotações pessoais',
        'Relatórios simples'
      ],
      limitations: [
        'Funcionalidades limitadas',
        'Suporte básico por email',
        'Sem backup automático'
      ],
      current: true
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
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      popular: true,
      features: [
        'Tudo do plano Starter',
        'Clientes ilimitados',
        'Dashboard avançado com insights',
        'Gestão financeira completa',
        'Controle de pagamentos',
        'Sistema de parcelas',
        'Fechamento de caixa',
        'Controle de despesas',
        'Relatórios financeiros detalhados',
        'Gestão de estoque avançada',
        'Transações de estoque',
        'Alertas de estoque baixo',
        'Histórico completo',
        'Suporte prioritário'
      ],
      limitations: []
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
      description: 'Para clínicas e salões',
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      features: [
        'Tudo do plano Professional',
        'Analytics avançados',
        'Dashboard executivo',
        'Auditoria completa',
        'Logs de segurança',
        'Backup automático',
        'Múltiplos usuários (até 10)',
        'Relatórios personalizados',
        'Exportação PDF/Excel',
        'Suporte 24/7 prioritário',
        'Consultoria mensal',
        'Integrações futuras',
        'API personalizada'
      ],
      limitations: []
    }
  ];

  const faqs = [
    {
      question: 'Posso trocar de plano a qualquer momento?',
      answer: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente.'
    },
    {
      question: 'Existe contrato de fidelidade?',
      answer: 'Não! Todos os nossos planos são mensais e você pode cancelar a qualquer momento sem taxas adicionais.'
    },
    {
      question: 'Como funciona o parcelamento do plano anual?',
      answer: 'O pagamento anual pode ser parcelado em até 10x sem juros no cartão de crédito, facilitando o investimento no seu negócio.'
    },
    {
      question: 'Quais funcionalidades estão disponíveis agora?',
      answer: 'Atualmente temos: Dashboard, Clientes, Agendamentos, Serviços, Estoque, Financeiro, Relatórios, Anotações e Configurações totalmente funcionais.'
    },
    {
      question: 'Os dados ficam seguros?',
      answer: 'Sim! Utilizamos criptografia de ponta e todas as operações são registradas em logs de auditoria para garantir a segurança total dos seus dados.'
    },
    {
      question: 'Há desconto para pagamento anual?',
      answer: 'Sim! Oferecemos 30% de desconto para pagamentos anuais em todos os planos pagos, com opção de parcelamento em até 10x.'
    }
  ];

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
            <main className="flex-1 p-6 bg-background overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-12">
                {/* Hero Section */}
                <div className="text-center space-y-6 py-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <Sparkles className="w-4 h-4" />
                    Escolha o plano ideal
                  </div>
                  <h1 className="text-4xl font-bold text-foreground max-w-3xl mx-auto">
                    Impulsione seu negócio de estética
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Sistema completo para gestão do seu negócio. 
                    Dashboard, clientes, agendamentos, financeiro e muito mais.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                    🎉 Promoção de Lançamento: 30% OFF nos primeiros 3 meses
                  </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 py-4">
                  <span className={`text-sm font-medium transition-colors ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Mensal
                  </span>
                  <Switch
                    checked={isAnnual}
                    onCheckedChange={setIsAnnual}
                    className="data-[state=checked]:bg-primary"
                  />
                  <span className={`text-sm font-medium transition-colors ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Anual
                  </span>
                  {isAnnual && (
                    <Badge className="bg-green-500 text-white ml-2">
                      30% OFF + Parcele em 10x
                    </Badge>
                  )}
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {plans.map((plan) => {
                    const currentPrice = isAnnual ? plan.annualPrice : plan.price;
                    const currentPeriod = isAnnual ? plan.annualPeriod : plan.period;
                    const currentOriginalPrice = isAnnual ? plan.annualOriginalPrice : plan.originalPrice;
                    const installmentPrice = isAnnual && plan.annualPrice !== 'Gratuito' 
                      ? `${Math.round(parseInt(plan.annualPrice.replace('R$ ', '').replace('.', '')) / 10)}`
                      : null;

                    return (
                      <Card 
                        key={plan.id} 
                        className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 ${
                          plan.popular 
                            ? 'border-primary shadow-xl scale-[1.02] bg-gradient-to-b from-background to-primary/5' 
                            : plan.current 
                              ? 'border-green-500 bg-gradient-to-b from-background to-green-50 dark:to-green-950/20' 
                              : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-0 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-primary-foreground shadow-lg">
                              🔥 Mais Popular
                            </Badge>
                          </div>
                        )}
                        
                        {plan.current && (
                          <div className="absolute -top-0 left-1/2 -translate-x-1/2">
                            <Badge className="bg-green-500 text-white shadow-lg">
                              ✅ Plano Atual
                            </Badge>
                          </div>
                        )}

                        <CardHeader className="text-center space-y-6 pt-8">
                          <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg`}>
                            <plan.icon className="w-10 h-10 text-white" />
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                            <p className="text-muted-foreground">{plan.description}</p>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-baseline justify-center gap-2">
                              {currentOriginalPrice && (
                                <span className="text-lg text-muted-foreground line-through">{currentOriginalPrice}</span>
                              )}
                              <span className="text-5xl font-bold text-foreground">{currentPrice}</span>
                              {currentPeriod && <span className="text-muted-foreground text-lg">{currentPeriod}</span>}
                            </div>
                            {currentOriginalPrice && (
                              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Economize {Math.round((1 - parseInt(currentPrice.replace('R$ ', '').replace('.', '')) / parseInt(currentOriginalPrice.replace('R$ ', '').replace('.', ''))) * 100)}%
                              </div>
                            )}
                            {installmentPrice && (
                              <div className="text-sm text-muted-foreground">
                                ou 10x de R$ {installmentPrice} sem juros
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-6 px-6">
                          {/* Features */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-500" />
                              Recursos disponíveis:
                            </h4>
                            <ul className="space-y-3">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                                  </div>
                                  <span className="text-sm text-foreground leading-relaxed">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Limitations */}
                          {plan.limitations.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-border/50">
                              <h4 className="font-semibold text-muted-foreground text-sm">Limitações:</h4>
                              <ul className="space-y-2">
                                {plan.limitations.map((limitation, index) => (
                                  <li key={index} className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{limitation}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="pt-6 px-6 pb-6">
                          <Button 
                            className={`w-full h-12 text-base font-medium transition-all duration-200 ${
                              plan.current 
                                ? 'bg-green-500 hover:bg-green-600 text-white' 
                                : plan.popular 
                                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl' 
                                  : 'bg-background border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                            }`}
                            disabled={plan.current}
                          >
                            {plan.current ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Plano Atual
                              </>
                            ) : (
                              <>
                                Escolher {plan.name}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>

                {/* FAQ Section */}
                <div className="space-y-8 py-8">
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-bold text-foreground">
                      Perguntas Frequentes
                    </h2>
                    <p className="text-muted-foreground">
                      Tire suas dúvidas sobre nossos planos
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {faqs.map((faq, index) => (
                      <Card key={index} className="hover:shadow-md transition-all duration-200 border-border/50">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-foreground mb-3 leading-relaxed">
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

                {/* Contact Section */}
                <div className="text-center bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl p-8 border border-primary/20">
                  <div className="space-y-6">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-foreground">
                        Precisa de algo personalizado?
                      </h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Para empresas com necessidades específicas, criamos soluções 
                        sob medida para seu negócio.
                      </p>
                    </div>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl">
                      <span>Falar com Especialista</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
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
