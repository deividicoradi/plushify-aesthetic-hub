
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
      '1 usuário',
      'Até 5 clientes',
      'Até 3 agendamentos',
      'Até 2 serviços',
      'Estoque básico (10 produtos)',
      'Dashboard básico'
    ],
    limitations: [
      'Acesso limitado a 3 dias',
      'SEM gestão financeira',
      'SEM relatórios avançados',
      'SEM controle de caixa',
      'SEM exportação de dados',
      'SEM suporte técnico',
      'Dados removidos após trial'
    ],
    trial: true,
    current: currentPlan === 'trial'
  },
  {
    id: 'professional',
    name: 'Profissional',
    price: 'R$ 89',
    period: '/mês',
    originalPrice: 'R$ 127',
    annualPrice: 'R$ 890',
    annualPeriod: '/ano',
    annualOriginalPrice: 'R$ 1.068',
    description: 'Para profissionais independentes',
    subtitle: 'Ideal para freelancers e pequenos negócios',
    icon: Zap,
    features: [
      'Até 2 usuários ativos',
      'Clientes ilimitados',
      'Agendamentos ilimitados',
      'Até 20 serviços',
      'Estoque até 100 produtos',
      'Gestão financeira básica',
      'Gestão de equipe simples',
      'Controle de caixa',
      'Relatórios básicos',
      'Métodos de pagamento múltiplos',
      'Dashboard com métricas',
      'Suporte prioritário'
    ],
    limitations: [
      'SEM analytics avançados',
      'SEM exportação de relatórios',
      'SEM pagamentos recorrentes',
      'SEM backup automático'
    ],
    current: currentPlan === 'professional'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 179',
    period: '/mês',
    originalPrice: 'R$ 249',
    annualPrice: 'R$ 1.790',
    annualPeriod: '/ano',
    annualOriginalPrice: 'R$ 2.148',
    description: 'RECOMENDADO - Para crescimento acelerado',
    subtitle: 'A escolha dos profissionais que faturam mais',
    icon: Crown,
    premium: true,
    mostComplete: true,
    features: [
      'Até 5 usuários com acesso simultâneo',
      'TUDO do plano Profissional',
      'Serviços e produtos ilimitados',
      'Analytics avançados e preditivos',
      'Relatórios completos com exportação',
      'Pagamentos recorrentes e parcelamentos',
      'Gestão de equipe avançada',
      'Backup automático',
      'Suporte VIP 24/7',
      'Gestão de estoque avançada',
      'Dashboard executivo completo',
      'Análises de performance detalhadas'
    ],
    limitations: [],
    current: currentPlan === 'premium'
  }
];
