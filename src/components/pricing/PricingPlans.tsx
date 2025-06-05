
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { CurrentPlanInfo } from './CurrentPlanInfo';
import { PricingTabs } from './PricingTabs';
import { SystemStatus } from './SystemStatus';
import { pricingPlans } from './planConfig';

export const PricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLoading, tier: currentTier, subscribeToPlan, getCurrentPlanInfo } = useSubscription();
  
  const handleSubscribe = async (planTier: SubscriptionTier) => {
    console.log('🎯 Tentando assinar:', { planTier, isYearly, user: user?.email });
    
    if (!user) {
      toast.error("Você precisa estar logado para assinar um plano");
      navigate('/auth?redirect=planos');
      return;
    }
    
    if (planTier === 'free') {
      toast.info("Escolha um plano pago para acessar o dashboard!");
      return;
    }
    
    if (planTier === currentTier) {
      toast.info("Você já está neste plano!");
      return;
    }
    
    setProcessingPlan(planTier);
    
    try {
      console.log('💳 Iniciando pagamento:', {
        plano: planTier,
        modo: isYearly ? 'ANUAL' : 'MENSAL',
        usuario: user.email
      });
      
      const checkoutUrl = await subscribeToPlan(planTier, isYearly);
      
      if (checkoutUrl) {
        console.log('✅ Redirecionando para:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        toast.error("Erro ao processar pagamento. Tente novamente.");
      }
    } catch (error) {
      console.error('💥 Erro:', error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setProcessingPlan(null);
    }
  };
  
  const currentPlanInfo = getCurrentPlanInfo();

  return (
    <div>
      <CurrentPlanInfo
        planName={currentPlanInfo.name}
        isSubscribed={currentPlanInfo.isSubscribed}
        expiresAt={currentPlanInfo.expiresAt}
      />

      <PricingTabs
        plans={pricingPlans}
        isYearly={isYearly}
        setIsYearly={setIsYearly}
        isLoading={isLoading}
        processingPlan={processingPlan}
        currentTier={currentTier}
        onSubscribe={handleSubscribe}
      />
      
      <SystemStatus
        isYearly={isYearly}
        processingPlan={processingPlan}
      />
    </div>
  );
};
