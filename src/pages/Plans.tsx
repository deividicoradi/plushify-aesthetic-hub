import React, { useState, useEffect } from 'react';
import { Clock, Zap, Crown } from 'lucide-react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripeCheckoutIndividual } from '@/hooks/useStripeCheckoutIndividual';
import { useToast } from '@/hooks/use-toast';
import { PlansHero } from '@/components/plans/PlansHero';
import { PlanAlerts } from '@/components/plans/PlanAlerts';
import { PlanCard } from '@/components/plans/PlanCard';
import { TestimonialsSection } from '@/components/plans/TestimonialsSection';
import { FAQSection } from '@/components/plans/FAQSection';
import { CTASection } from '@/components/plans/CTASection';

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { currentPlan, subscription, loading, checkSubscriptionStatus } = useSubscription();
  const { createCheckout, openCustomerPortal, isLoading } = useStripeCheckoutIndividual();
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
      checkSubscriptionStatus();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (canceled === 'true') {
      toast({
        title: "Pagamento cancelado",
        description: "Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
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
        'Dashboard básico'
      ],
      limitations: [
        'Acesso limitado a 3 dias',
        'Funcionalidades muito restritas',
        'Sem suporte técnico',
        'Dados removidos após trial',
        'Sem exportação de relatórios',
        'Sem backup automático'
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
        'Clientes ilimitados',
        'Agendamentos ilimitados',
        'Gestão de serviços completa',
        'Gestão de estoque ilimitada',
        'Dashboard com métricas avançadas',
        'Gestão financeira completa',
        'Controle de caixa',
        'Relatórios financeiros detalhados',
        'Exportação básica de dados'
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
        'Dashboard executivo com analytics',
        'Relatórios avançados com gráficos',
        'Exportação de relatórios (PDF completo)',
        'Analytics detalhados de performance',
        'Suporte VIP prioritário',
        'Análises preditivas de faturamento',
        'Segurança avançada com logs'
      ],
      bonuses: [
        'Setup personalizado GRÁTIS',
        'Treinamento VIP incluso',
        'Suporte técnico exclusivo',
        'Selo de cliente Premium',
        'Acesso prioritário a novas funcionalidades',
        'Consultoria de negócios inclusa'
      ],
      limitations: [],
      current: currentPlan === 'premium'
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
                <PlansHero />

                {/* Current Plan Alert */}
                <PlanAlerts 
                  currentPlan={currentPlan}
                  onPlanSelection={handlePlanSelection}
                  onManageSubscription={handleManageSubscription}
                  isLoading={isLoading}
                  isAnnual={isAnnual}
                />

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
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      isAnnual={isAnnual}
                      onPlanSelection={handlePlanSelection}
                      isLoading={isLoading}
                    />
                  ))}
                </div>

                {/* Social Proof Section */}
                <TestimonialsSection />

                {/* FAQ Section */}
                <FAQSection />

                {/* Final CTA Section */}
                <CTASection 
                  onPlanSelection={handlePlanSelection}
                  isLoading={isLoading}
                  isAnnual={isAnnual}
                />
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Plans;
