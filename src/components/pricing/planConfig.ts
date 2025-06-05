
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
      { included: false, text: 'Acesso ao dashboard completo' },
      { included: false, text: 'Gestão de clientes' },
      { included: false, text: 'Agendamentos' },
      { included: false, text: 'Relatórios básicos' },
      { included: false, text: 'Relatórios avançados' },
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
      { included: true, text: 'Acesso completo ao dashboard' },
      { included: true, text: 'Agendamentos ilimitados' },
      { included: true, text: 'Gestão completa de clientes' },
      { included: true, text: 'Lembretes automáticos' },
      { included: true, text: 'Controle de insumos' },
      { included: true, text: 'Relatórios básicos' },
      { included: false, text: 'Relatórios avançados com gráficos' },
      { included: false, text: 'Marketing com IA' },
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
      { included: true, text: 'Relatórios avançados com gráficos' },
      { included: true, text: 'Insights e análises inteligentes' },
      { included: true, text: 'Marketing com IA' },
      { included: true, text: 'Painel analítico completo' },
      { included: true, text: 'Automação avançada' },
      { included: true, text: 'Cursos e certificados' },
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
      { included: true, text: 'Relatórios personalizados' },
      { included: true, text: 'Exportação para PDF/Excel' },
      { included: true, text: 'Automação com IA avançada' },
      { included: true, text: 'Campanias inteligentes' },
      { included: true, text: 'Programa de afiliados' },
      { included: true, text: 'Suporte prioritário' },
    ],
    buttonText: 'Escolher Premium',
  },
];
