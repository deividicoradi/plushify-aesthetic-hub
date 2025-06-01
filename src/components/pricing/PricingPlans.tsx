import React, { useState } from 'react';
import { PricingTier } from './PricingTier';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLoading, tier: currentTier, subscribeToPlan, simulateSubscription } = useSubscription();
  
  const handleSubscribe = async (planTier: SubscriptionTier) => {
    if (!user) {
      toast.error("Você precisa estar logado para assinar um plano");
      navigate('/auth?redirect=planos');
      return;
    }
    
    if (planTier === 'free') {
      await simulateSubscription('free');
      return;
    }
    
    if (planTier === currentTier) {
      toast.info("Você já está neste plano!");
      return;
    }
    
    console.log('Tentando assinar plano:', planTier);
    
    try {
      const checkoutUrl = await subscribeToPlan(planTier, isYearly);
      
      if (checkoutUrl) {
        console.log('Redirecionando para Stripe:', checkoutUrl);
        window.open(checkoutUrl, '_blank');
        toast.success("Redirecionando para o pagamento...");
      } else {
        // Só oferece simulação se o pagamento real falhar completamente
        console.log('Checkout URL não recebida, oferecendo simulação');
        const shouldSimulate = window.confirm(
          'Houve um problema com o sistema de pagamento. Deseja simular a assinatura para testar a funcionalidade?'
        );
        
        if (shouldSimulate) {
          await simulateSubscription(planTier);
        }
      }
    } catch (error) {
      console.error('Erro no processo de assinatura:', error);
      toast.error("Erro ao processar assinatura. Tente novamente.");
    }
  };
  
  // Valores atualizados com preços mensais, anuais e parcelados
  const pricingPlans = [
    {
      tier: 'free',
      title: 'Free',
      price: 0,
      yearlyPrice: 0,
      parcelValue: 0,
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
      price: 69.90,
      yearlyPrice: 55.90,
      parcelValue: 6.99,
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
      price: 119.90,
      yearlyPrice: 95.90,
      parcelValue: 11.99,
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
      price: 199.90,
      yearlyPrice: 159.90,
      parcelValue: 19.99,
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
      <Tabs defaultValue="mensal" className="w-full mt-8">
        <TabsList className="mx-auto mb-4 border border-plush-200 bg-white">
          <TabsTrigger value="mensal" onClick={() => setIsYearly(false)}>
            Mensal
          </TabsTrigger>
          <TabsTrigger value="anual" onClick={() => setIsYearly(true)}>
            Anual <span className="text-xs font-medium ml-1">(-20%)</span>
          </TabsTrigger>
        </TabsList>
        
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
              parcelValue={plan.parcelValue}
              description={plan.description}
              features={plan.features}
              buttonText={plan.buttonText}
              isLoading={isLoading}
              isCurrentPlan={currentTier === plan.tier}
              onSubscribe={() => handleSubscribe(plan.tier as SubscriptionTier)}
            />
          ))}
        </div>
      </Tabs>
      
      {/* Indicador de modo de desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Modo de desenvolvimento:</strong> Se o sistema de pagamento não estiver configurado, 
            você pode simular assinaturas para testar a funcionalidade.
          </p>
        </div>
      )}
    </div>
  );
};
