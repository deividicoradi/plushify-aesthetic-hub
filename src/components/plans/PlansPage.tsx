
import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useStripeCheckoutIndividual } from '@/hooks/useStripeCheckoutIndividual';
import { useToast } from '@/hooks/use-toast';
import { PlansHero } from './PlansHero';
import { PlanAlerts } from './PlanAlerts';
import { BillingToggle } from './BillingToggle';
import { PlansGrid } from './PlansGrid';
import { TestimonialsSection } from './TestimonialsSection';
import { FAQSection } from './FAQSection';
import { CTASection } from './CTASection';
import { createPlansData } from '@/utils/plans/plansData';

export const PlansPage: React.FC = () => {
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

  const plans = createPlansData(currentPlan);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
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
      <BillingToggle
        isAnnual={isAnnual}
        onToggle={setIsAnnual}
      />

      {/* Plans Grid */}
      <PlansGrid
        plans={plans}
        isAnnual={isAnnual}
        onPlanSelection={handlePlanSelection}
        isLoading={isLoading}
      />

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
  );
};
