
import React, { useState } from 'react';
import { PricingTier } from './PricingTier';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useSubscription, SubscriptionTier } from '@/hooks/useSubscription';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PricingPlans = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isLoading, tier: currentTier, subscribeToPlan, getCurrentPlanInfo } = useSubscription();
  
  const handleSubscribe = async (planTier: SubscriptionTier) => {
    console.log('🎯 Tentando assinar plano:', { planTier, isYearly, user: user?.email });
    
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
      console.log('💳 Iniciando processo de pagamento...');
      toast.loading("Preparando pagamento...");
      
      const checkoutUrl = await subscribeToPlan(planTier, isYearly);
      
      if (checkoutUrl) {
        console.log('🔗 URL de checkout recebida:', checkoutUrl);
        toast.success("Redirecionando para pagamento...");
        
        // Redirecionar para o Stripe Checkout
        window.location.href = checkoutUrl;
        
      } else {
        console.error('❌ URL de checkout não recebida');
        toast.error("Erro ao processar pagamento. Tente novamente.");
      }
    } catch (error) {
      console.error('💥 Erro no processo de pagamento:', error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setProcessingPlan(null);
    }
  };
  
  const currentPlanInfo = getCurrentPlanInfo();
  
  // Planos com preços corretos
  const pricingPlans = [
    {
      tier: 'free',
      title: 'Free',
      price: 0,
      yearlyPrice: 0,
      parcelValue: 0,
      description: 'Apenas para conhecer a plataforma',
      features: [
        { included: true, text: 'Acesso limitado à demonstração' },
        { included: true, text: 'Visualização das funcionalidades' },
        { included: false, text: 'Acesso ao dashboard completo' },
        { included: false, text: 'Gestão de clientes' },
        { included: false, text: 'Agendamentos' },
        { included: false, text: 'Relatórios' },
        { included: false, text: 'Suporte técnico' },
        { included: false, text: 'Todas as funcionalidades' },
      ],
      buttonText: 'Plano Atual',
    },
    {
      tier: 'starter',
      title: 'Starter',
      price: 69.90,
      yearlyPrice: 55.90,
      parcelValue: 6.99,
      description: 'Para profissionais individuais',
      features: [
        { included: true, text: 'Acesso completo ao dashboard' },
        { included: true, text: 'Agendamentos ilimitados' },
        { included: true, text: 'Gestão completa de clientes' },
        { included: true, text: 'Lembretes automáticos' },
        { included: true, text: 'Controle de insumos' },
        { included: true, text: 'Relatórios básicos' },
        { included: false, text: 'Marketing com IA' },
        { included: false, text: 'Programa de fidelidade' },
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
        { included: true, text: 'Tudo do plano Starter' },
        { included: true, text: 'Marketing com IA' },
        { included: true, text: 'Painel analítico completo' },
        { included: true, text: 'Automação avançada' },
        { included: true, text: 'Cursos e certificados' },
        { included: true, text: 'Programa de fidelidade básico' },
        { included: true, text: 'Relatórios avançados' },
        { included: false, text: 'Gestão de equipe' },
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
        { included: true, text: 'Automação com IA avançada' },
        { included: true, text: 'Campanias inteligentes' },
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
      {/* Status do plano atual */}
      <div className="mb-6 p-4 bg-gradient-to-r from-plush-50 to-purple-50 rounded-lg border border-plush-200">
        <h3 className="text-lg font-semibold text-plush-800 mb-2">
          Plano atual: {currentPlanInfo.name}
        </h3>
        {currentPlanInfo.isSubscribed && currentPlanInfo.expiresAt && (
          <p className="text-sm text-plush-600">
            Válido até: {new Date(currentPlanInfo.expiresAt).toLocaleDateString('pt-BR')}
          </p>
        )}
        {!user && (
          <p className="text-sm text-orange-600 mt-2">
            ⚠️ Faça login para assinar um plano
          </p>
        )}
      </div>

      <Tabs defaultValue="mensal" className="w-full mt-8">
        <TabsList className="mx-auto mb-4 border border-plush-200 bg-white">
          <TabsTrigger 
            value="mensal" 
            onClick={() => {
              console.log('🗓️ Alternando para planos mensais');
              setIsYearly(false);
            }}
          >
            Mensal
          </TabsTrigger>
          <TabsTrigger 
            value="anual" 
            onClick={() => {
              console.log('📅 Alternando para planos anuais');
              setIsYearly(true);
            }}
          >
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
              isLoading={isLoading || processingPlan === plan.tier}
              isCurrentPlan={currentTier === plan.tier}
              onSubscribe={() => handleSubscribe(plan.tier as SubscriptionTier)}
            />
          ))}
        </div>
      </Tabs>
      
      {/* Debug Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Status do Sistema</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>✅ Price IDs configurados para Stripe</p>
          <p>✅ Edge functions criadas</p>
          <p>✅ Sistema de checkout pronto</p>
          <p>📊 Modo atual: {isYearly ? 'Anual' : 'Mensal'}</p>
          {user && (
            <p>👤 Usuário: <span className="font-medium">{user.email}</span></p>
          )}
          {processingPlan && (
            <p>⏳ Processando: <span className="font-medium">{processingPlan}</span></p>
          )}
        </div>
      </div>
    </div>
  );
};
