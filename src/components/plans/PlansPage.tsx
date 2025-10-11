
import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripeCheckoutIndividual } from '@/hooks/useStripeCheckoutIndividual';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PlansHero } from './PlansHero';
import { PlanAlerts } from './PlanAlerts';
import { BillingToggle } from './BillingToggle';
import { PlansGrid } from './PlansGrid';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { createPlansData } from '@/utils/plans/plansData';
import Navbar from '../Navbar';
import Footer from '../Footer';

export const PlansPage: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const { user } = useAuth();
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
    if (planId === 'trial') {
      // Trial: chamar start_subscription no frontend
      if (!user?.id) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para começar o trial.",
          variant: "destructive",
        });
        return;
      }

      try {
        const { data, error } = await supabase.rpc('start_subscription', {
          p_user_id: user.id,
          p_plan_code: 'trial',
          p_billing_interval: 'month',
          p_trial_days: 3
        });

        if (error) throw error;

        toast({
          title: "Trial ativado com sucesso!",
          description: "Você tem 3 dias para explorar a plataforma.",
        });

        // Atualizar status da assinatura
        await checkSubscriptionStatus();
      } catch (error: any) {
        console.error('Erro ao ativar trial:', error);
        toast({
          title: "Erro ao ativar trial",
          description: error.message || "Tente novamente mais tarde.",
          variant: "destructive",
        });
      }
      return;
    }
    
    if (planId === 'professional' || planId === 'premium') {
      const billingPeriod = isAnnual ? 'annual' : 'monthly';
      await createCheckout(planId as 'professional' | 'premium', billingPeriod);
    }
  };

  const handleManageSubscription = async () => {
    await openCustomerPortal();
  };

  const plans = createPlansData(currentPlan);

  // Conteúdo principal dos planos (sem navbar/footer quando logado)
  const plansContent = (
    <>
      {/* Current Plan Alert */}
      <PlanAlerts 
        currentPlan={currentPlan}
        onPlanSelection={handlePlanSelection}
        onManageSubscription={handleManageSubscription}
        isLoading={isLoading}
        isAnnual={isAnnual}
      />

      {/* Billing Toggle */}
      <div className="flex justify-center">
        <BillingToggle
          isAnnual={isAnnual}
          onToggle={setIsAnnual}
        />
      </div>

      {/* Plans Grid */}
      <PlansGrid
        plans={plans}
        isAnnual={isAnnual}
        onPlanSelection={handlePlanSelection}
        isLoading={isLoading}
      />

      {/* FAQ Section */}
      <div className="pt-8">
        <FAQSection />
      </div>
    </>
  );

  // Se estiver logado, retornar apenas o conteúdo (sem navbar/footer)
  if (user) {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {plansContent}
      </div>
    );
  }

  // Layout público (não logado) com navbar e footer
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="min-h-screen">
        {/* Hero Section with Modern Background */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <PlansHero />
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            {plansContent}
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <TestimonialsSection />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <FAQSection />
          </div>
        </section>

        {/* Final CTA Section - apenas para não logados */}
        <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <CTASection 
              onPlanSelection={handlePlanSelection}
              isLoading={isLoading}
              isAnnual={isAnnual}
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
