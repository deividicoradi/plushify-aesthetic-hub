
import { Clock, Zap, Crown } from 'lucide-react';

export interface PlanFeature {
  id: string;
  name: string;
  price: string;
  period: string;
  originalPrice: string;
  annualPrice: string;
  annualPeriod: string;
  annualOriginalPrice: string;
  description: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  features: string[];
  limitations: string[];
  bonuses?: string[];
  trial?: boolean;
  current: boolean;
  premium?: boolean;
  mostComplete?: boolean;
}

export const createPlansData = (currentPlan: string): PlanFeature[] => [
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
    description: 'Para profissionais independentes',
    subtitle: 'Ideal para freelancers e pequenos negócios',
    icon: Zap,
    features: [
      'Clientes ilimitados',
      'Agendamentos ilimitados',
      'Gestão de serviços completa',
      'Gestão de estoque básica',
      'Dashboard com métricas básicas',
      'Controle de caixa simples',
      'Relatórios básicos'
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
      'Gestão financeira completa avançada',
      'Dashboard executivo com analytics',
      'Relatórios avançados com gráficos',
      'Exportação de relatórios (PDF completo)',
      'Analytics detalhados de performance',
      'Gestão de estoque avançada',
      'Controle de caixa com múltiplos métodos',
      'Parcelamentos e recorrências',
      'Suporte VIP prioritário',
      'Análises preditivas de faturamento'
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
