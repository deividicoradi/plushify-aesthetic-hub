
import { SubscriptionTier } from '@/hooks/useSubscription';

export interface PlanFeature {
  included: boolean;
  text: string;
}

export interface PlanConfig {
  tier: SubscriptionTier;
  title: string;
  price: number;
  yearlyPrice: number;
  parcelValue: number;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  isPopular?: boolean;
}

export const pricingPlans: PlanConfig[] = [
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
      { included: true, text: 'Máximo 5 clientes' },
      { included: true, text: 'Máximo 10 agendamentos/mês' },
      { included: false, text: 'Dashboard completo' },
      { included: false, text: 'Gestão de clientes' },
      { included: false, text: 'Controle de estoque' },
      { included: false, text: 'Sistema de notas' },
      { included: false, text: 'Suporte técnico' },
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
      { included: true, text: 'Clientes ilimitados' },
      { included: true, text: 'Agendamentos ilimitados' },
      { included: true, text: 'Dashboard com métricas' },
      { included: true, text: 'Gestão de clientes completa' },
      { included: true, text: 'Controle básico de estoque' },
      { included: true, text: 'Sistema de notas' },
      { included: true, text: 'Relatórios básicos' },
      { included: false, text: 'Sistema de fidelidade' },
      { included: false, text: 'Gestão de serviços' },
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
      { included: true, text: 'Sistema de fidelidade' },
      { included: true, text: 'Gestão de serviços' },
      { included: true, text: 'Controle avançado de estoque' },
      { included: true, text: 'Relatórios detalhados' },
      { included: true, text: 'Sistema de comunicação' },
      { included: true, text: 'Templates de mensagens' },
      { included: true, text: 'Suporte prioritário' },
    ],
    buttonText: 'Escolher Pro',
  },
  {
    tier: 'premium',
    title: 'Premium',
    price: 199.90,
    yearlyPrice: 159.90,
    parcelValue: 19.99,
    description: 'Solução completa para empresas',
    features: [
      { included: true, text: 'Tudo do plano Pro' },
      { included: true, text: 'Analytics avançados' },
      { included: true, text: 'Automação de processos' },
      { included: true, text: 'Exportação de dados' },
      { included: true, text: 'Sistema de notificações' },
      { included: true, text: 'Backup automático' },
      { included: true, text: 'Suporte prioritário 24/7' },
      { included: true, text: 'Período de teste estendido (30 dias)' },
      { included: true, text: 'Parcelamento em até 12x' },
      { included: true, text: 'Desconto anual de 20%' },
    ],
    buttonText: 'Escolher Premium',
  },
];
