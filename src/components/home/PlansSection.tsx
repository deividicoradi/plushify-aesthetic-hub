
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Crown, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createPlansData } from '@/utils/plans/plansData';
import { useAuth } from '@/contexts/AuthContext';
import { setPendingCheckout, type PendingPlanType } from '@/utils/pendingCheckout';
import { useToast } from '@/hooks/use-toast';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { supabase } from '@/integrations/supabase/client';

export const PlansSection = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { createCheckout, loading: checkoutLoading } = useStripeCheckout();

  // Usar dados centralizados dos planos
  const plansData = createPlansData('none'); // Não há plano atual na home
  const sourcePlans = isAnnual ? plansData.filter(p => p.id !== 'trial') : plansData;
  const plans = sourcePlans.map(plan => ({
    ...plan,
    buttonText: plan.id === 'trial' ? 'Começar Grátis' : 
                plan.id === 'professional' ? 'Escolher Professional' : 
                'Escolher Enterprise',
    popular: plan.mostComplete || false
  }));

  const handlePlanClick = async (planId: string) => {
    const validPlans: PendingPlanType[] = ['trial', 'professional', 'premium'];
    if (!validPlans.includes(planId as PendingPlanType)) {
      return;
    }

    const billingPeriod = isAnnual ? 'annual' : 'monthly';
    setPendingCheckout(planId as PendingPlanType, billingPeriod);

    if (authLoading) return;

    if (!user) {
      toast({
        title: 'Crie sua conta para continuar',
        description: 'Após entrar, seu plano será retomado automaticamente.',
      });
      navigate('/auth?tab=signup&redirect=checkout');
      return;
    }

    if (planId === 'trial') {
      try {
        const { data, error } = await supabase.functions.invoke('start-trial');
        if (error) throw error;
        if (data?.error) throw new Error(data.message || data.error);

        toast({
          title: 'Trial ativado com sucesso!',
          description: 'Você tem 3 dias para explorar a plataforma.',
        });
        navigate('/dashboard');
      } catch (error: any) {
        toast({
          title: 'Erro ao ativar trial',
          description: error?.message || 'Tente novamente mais tarde.',
          variant: 'destructive',
        });
      }
      return;
    }

    await createCheckout(planId as 'professional' | 'premium', billingPeriod);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Escolha o plano ideal para seu negócio
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transforme sua gestão empresarial com ferramentas profissionais que realmente funcionam
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-background rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                !isAnnual
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                isAnnual
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anual
              <Badge className="ml-2 bg-green-500 text-white text-xs">17% OFF</Badge>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className={`grid grid-cols-1 gap-8 max-w-6xl mx-auto ${
          plans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
        }`}>
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            const currentPrice = isAnnual ? plan.annualPrice : plan.price;
            const currentPeriod = isAnnual ? plan.annualPeriod : plan.period;
            const originalPrice = isAnnual ? plan.annualOriginalPrice : plan.originalPrice;

            return (
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${
                  plan.popular
                    ? 'border-2 border-primary shadow-xl scale-105 z-10'
                    : 'border hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <Badge className="bg-primary text-primary-foreground shadow-lg text-sm px-3 py-1">
                      🔥 MAIS POPULAR
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center space-y-4 pt-8">
                  <div className={`w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center p-4 ${
                    plan.popular ? 'animate-pulse' : ''
                  }`}>
                    <IconComponent className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      {originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">
                          {originalPrice}
                        </span>
                      )}
                      <span className={`${plan.popular ? 'text-4xl text-primary' : 'text-3xl'} font-bold`}>
                        {currentPrice}
                      </span>
                      {currentPeriod && (
                        <span className="text-muted-foreground">{currentPeriod}</span>
                      )}
                    </div>
                    {originalPrice && (
                      <div className="text-sm font-semibold text-green-600">
                        Economize 17%
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 px-6">
                  <div className="space-y-3">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-sm leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                    disabled={authLoading || checkoutLoading}
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    <span>{plan.buttonText}</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Comece hoje mesmo • Resultados garantidos • Suporte completo
          </p>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => navigate('/planos')}
            className="font-semibold"
          >
            Ver comparação completa dos planos
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};
