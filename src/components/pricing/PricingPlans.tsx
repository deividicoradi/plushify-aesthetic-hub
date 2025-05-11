
import React, { useState } from 'react';
import { PricingTier } from './PricingTier';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';

export const PricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLoading, tier: currentTier, subscribeToPlan } = useSubscription();
  
  const handleSubscribe = async (planTier: SubscriptionTier) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar um plano");
      navigate('/auth?redirect=planos');
      return;
    }
    
    if (planTier === 'free') {
      toast.success("Você já está no plano gratuito!");
      return;
    }
    
    const checkoutUrl = await subscribeToPlan(planTier, isYearly);
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };
  
  const pricingPlans = [
    {
      tier: 'free',
      title: 'Free',
      price: 0,
      yearlyPrice: 0,
      description: 'Para profissionais iniciando a carreira',
      features: [
        { included: true, text: 'Até 5 agendamentos' },
        { included: true, text: 'Lembretes simples por WhatsApp' },
        { included: true, text: 'Cadastro básico de clientes' },
        { included: false, text: 'Gestão de insumos' },
        { included: false, text: 'Marketing por IA' },
        { included: false, text: 'Painel analítico' },
        { included: false, text: 'Cursos e certificados' },
        { included: false, text: 'Programa de fidelidade' },
      ],
      buttonText: 'Começar Grátis',
    },
    {
      tier: 'starter',
      title: 'Starter',
      price: 59.90,
      yearlyPrice: 47.90,
      description: 'Para profissionais individuais',
      features: [
        { included: true, text: 'Agendamentos ilimitados' },
        { included: true, text: 'Lembretes automáticos personalizados' },
        { included: true, text: 'Gestão completa de clientes' },
        { included: true, text: 'Controle de insumos' },
        { included: true, text: 'Marketing básico' },
        { included: true, text: 'Painel analítico simplificado' },
        { included: false, text: 'Cursos e certificados' },
        { included: false, text: 'Programa de fidelidade avançado' },
      ],
      buttonText: 'Escolher Starter',
    },
    {
      tier: 'pro',
      isPopular: true,
      title: 'Pro',
      price: 99.90,
      yearlyPrice: 79.90,
      description: 'Para profissionais em crescimento',
      features: [
        { included: true, text: 'Agendamentos ilimitados' },
        { included: true, text: 'Lembretes automáticos personalizados' },
        { included: true, text: 'Gestão avançada de clientes' },
        { included: true, text: 'Controle completo de insumos' },
        { included: true, text: 'Marketing com IA' },
        { included: true, text: 'Painel analítico completo' },
        { included: true, text: 'Cursos e certificados' },
        { included: true, text: 'Programa de fidelidade básico' },
      ],
      buttonText: 'Escolher Pro',
    },
    {
      tier: 'premium',
      title: 'Premium',
      price: 179.90,
      yearlyPrice: 143.90,
      description: 'Para quem tem equipe ou rede',
      features: [
        { included: true, text: 'Tudo do plano Pro' },
        { included: true, text: 'Gestão de equipe multiusuário' },
        { included: true, text: 'Automação avançada com IA' },
        { included: true, text: 'Campanhas inteligentes' },
        { included: true, text: 'Programa de afiliados' },
        { included: true, text: 'Biolink personalizado' },
        { included: true, text: 'Programa de fidelidade avançado' },
        { included: true, text: 'Suporte prioritário' },
      ],
      buttonText: 'Escolher Premium',
    },
  ];

  return (
    <div>
      <div className="mt-8 inline-flex items-center border border-plush-200 p-1 rounded-full bg-white">
        <button
          className={`px-4 py-2 text-sm rounded-full transition-colors ${
            !isYearly ? 'bg-plush-600 text-white' : 'text-foreground hover:bg-plush-50'
          }`}
          onClick={() => setIsYearly(false)}
        >
          Mensal
        </button>
        <button
          className={`px-4 py-2 text-sm rounded-full transition-colors ${
            isYearly ? 'bg-plush-600 text-white' : 'text-foreground hover:bg-plush-50'
          }`}
          onClick={() => setIsYearly(true)}
        >
          Anual <span className="text-xs font-medium ml-1">(-20%)</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 mt-8">
        {pricingPlans.map((plan) => (
          <PricingTier
            key={plan.tier}
            tier={plan.tier}
            isPopular={plan.isPopular}
            isYearly={isYearly}
            title={plan.title}
            price={plan.price}
            yearlyPrice={plan.yearlyPrice}
            description={plan.description}
            features={plan.features}
            buttonText={plan.buttonText}
            isLoading={isLoading}
            isCurrentPlan={currentTier === plan.tier}
            onSubscribe={() => handleSubscribe(plan.tier as SubscriptionTier)}
          />
        ))}
      </div>
    </div>
  );
};
