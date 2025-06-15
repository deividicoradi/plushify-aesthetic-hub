
import React from 'react';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Plans = () => {
  const plans = [
    {
      id: 'basic',
      name: 'Gratuito',
      price: 'R$ 0',
      period: '/mês',
      description: 'Perfeito para começar',
      icon: Star,
      color: 'bg-gray-500',
      features: [
        'Até 50 clientes',
        'Agendamentos básicos',
        'Relatórios simples',
        'Suporte por email',
        '1 usuário'
      ],
      limitations: [
        'Sem backup automático',
        'Sem integrações',
        'Funcionalidades limitadas'
      ],
      current: true
    },
    {
      id: 'professional',
      name: 'Profissional',
      price: 'R$ 29',
      period: '/mês',
      description: 'Para profissionais em crescimento',
      icon: Zap,
      color: 'bg-blue-500',
      popular: true,
      features: [
        'Clientes ilimitados',
        'Agendamentos avançados',
        'Relatórios detalhados',
        'Suporte prioritário',
        'Até 3 usuários',
        'Backup automático',
        'Integrações básicas',
        'Gestão de estoque',
        'Marketing por email'
      ],
      limitations: []
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 59',
      period: '/mês',
      description: 'Para clínicas e salões',
      icon: Crown,
      color: 'bg-purple-500',
      features: [
        'Tudo do Profissional',
        'Usuários ilimitados',
        'IA para insights',
        'App personalizado',
        'Suporte 24/7',
        'Integrações avançadas',
        'Multi-localização',
        'Automação completa',
        'Dashboard executivo',
        'Consultoria mensal'
      ],
      limitations: []
    }
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header */}
            <header className="flex items-center gap-4 border-b border-border bg-background px-4 py-2">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">Planos</h1>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-8 bg-background">
              <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold text-foreground">
                    Escolha o plano ideal para seu negócio
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                    Cresça seu negócio de estética com as ferramentas certas. 
                    Todos os planos incluem suporte e atualizações gratuitas.
                  </p>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  {plans.map((plan) => (
                    <Card 
                      key={plan.id} 
                      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                        plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                      } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {plan.popular && (
                        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                          Mais Popular
                        </Badge>
                      )}
                      
                      {plan.current && (
                        <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                          Plano Atual
                        </Badge>
                      )}

                      <CardHeader className="text-center space-y-4 pb-8">
                        <div className={`w-16 h-16 mx-auto rounded-full ${plan.color} flex items-center justify-center`}>
                          <plan.icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                          <p className="text-muted-foreground">{plan.description}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                            <span className="text-muted-foreground">{plan.period}</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Features */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-foreground">Incluído:</h4>
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-3">
                                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-muted-foreground">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Limitations */}
                        {plan.limitations.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-foreground">Limitações:</h4>
                            <ul className="space-y-2">
                              {plan.limitations.map((limitation, index) => (
                                <li key={index} className="flex items-center gap-3">
                                  <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  </div>
                                  <span className="text-sm text-muted-foreground">{limitation}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="pt-6">
                        <Button 
                          className={`w-full ${
                            plan.current 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : plan.popular 
                                ? 'bg-primary hover:bg-primary/90' 
                                : 'bg-secondary hover:bg-secondary/80'
                          }`}
                          disabled={plan.current}
                        >
                          {plan.current ? 'Plano Atual' : `Escolher ${plan.name}`}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>

                {/* FAQ Section */}
                <div className="mt-16 text-center space-y-6">
                  <h2 className="text-3xl font-bold text-foreground">
                    Perguntas Frequentes
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">
                          Posso trocar de plano a qualquer momento?
                        </h3>
                        <p className="text-muted-foreground">
                          Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                          As mudanças entram em vigor imediatamente.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">
                          Existe contrato de fidelidade?
                        </h3>
                        <p className="text-muted-foreground">
                          Não! Todos os nossos planos são mensais e você pode cancelar 
                          a qualquer momento sem taxas adicionais.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">
                          Os dados ficam seguros?
                        </h3>
                        <p className="text-muted-foreground">
                          Sim! Utilizamos criptografia de ponta e backups automáticos para 
                          garantir a segurança total dos seus dados.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold text-foreground mb-2">
                          Posso testar antes de assinar?
                        </h3>
                        <p className="text-muted-foreground">
                          Claro! O plano gratuito permite testar todas as funcionalidades 
                          básicas sem compromisso.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="mt-16 text-center bg-muted/50 rounded-lg p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Precisa de um plano personalizado?
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Para empresas com necessidades específicas, oferecemos planos customizados 
                    com funcionalidades sob medida.
                  </p>
                  <Button variant="outline" size="lg">
                    Falar com Vendas
                  </Button>
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
