
import { useSubscription, PlanType } from './useSubscription';
import { useAuth } from '@/contexts/AuthContext';

interface PlanLimits {
  clients: number;
  appointments: number;
  products: number;
  services: number;
  hasFinancialManagement: boolean;
  hasAdvancedReports: boolean;
  hasAdvancedAnalytics: boolean;
  hasTeamManagement: boolean;
  hasAutomaticBackup: boolean;
  hasPrioritySupport: boolean;
  has24_7Support: boolean;
  hasInventoryAdvanced: boolean;
  hasReportsDetailed: boolean;
  hasExportReports: boolean;
  hasCashFlow: boolean;
  hasRecurringPayments: boolean;
  hasMultiplePaymentMethods: boolean;
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  trial: {
    clients: 5,
    appointments: 3,
    products: 10,
    services: 2,
    hasFinancialManagement: false,
    hasAdvancedReports: false,
    hasAdvancedAnalytics: false,
    hasTeamManagement: false,
    hasAutomaticBackup: false,
    hasPrioritySupport: false,
    has24_7Support: false,
    hasInventoryAdvanced: false,
    hasReportsDetailed: false,
    hasExportReports: false,
    hasCashFlow: false,
    hasRecurringPayments: false,
    hasMultiplePaymentMethods: false,
  },
  professional: {
    clients: -1, // unlimited
    appointments: -1, // unlimited
    products: 100, // limited to 100
    services: 20, // limited to 20
    hasFinancialManagement: true,
    hasAdvancedReports: false,
    hasAdvancedAnalytics: false,
    hasTeamManagement: false,
    hasAutomaticBackup: false,
    hasPrioritySupport: true,
    has24_7Support: false,
    hasInventoryAdvanced: false,
    hasReportsDetailed: true,
    hasExportReports: false,
    hasCashFlow: true,
    hasRecurringPayments: false,
    hasMultiplePaymentMethods: true,
  },
  premium: {
    clients: -1, // unlimited
    appointments: -1, // unlimited
    products: -1, // unlimited
    services: -1, // unlimited
    hasFinancialManagement: true,
    hasAdvancedReports: true,
    hasAdvancedAnalytics: true,
    hasTeamManagement: true,
    hasAutomaticBackup: true,
    hasPrioritySupport: true,
    has24_7Support: true,
    hasInventoryAdvanced: true,
    hasReportsDetailed: true,
    hasExportReports: true,
    hasCashFlow: true,
    hasRecurringPayments: true,
    hasMultiplePaymentMethods: true,
  },
};

// E-mail do usuário de teste com acesso completo
const TEST_USER_EMAIL = 'deividi@teste.com';

export const usePlanLimits = () => {
  const { currentPlan } = useSubscription();
  const { user } = useAuth();
  
  // Verificar se é o usuário de teste
  const isTestUser = user?.email === TEST_USER_EMAIL;
  
  // Se for usuário de teste, usar limites do plano premium
  const limits = isTestUser ? PLAN_LIMITS.premium : PLAN_LIMITS[currentPlan];
  
  const isLimited = (type: keyof Pick<PlanLimits, 'clients' | 'appointments' | 'products' | 'services'>) => {
    if (isTestUser) return false; // Usuário de teste não tem limites
    return limits[type] !== -1;
  };
  
  const getLimit = (type: keyof Pick<PlanLimits, 'clients' | 'appointments' | 'products' | 'services'>) => {
    if (isTestUser) return -1; // Usuário de teste tem limite infinito
    return limits[type];
  };
  
  const hasReachedLimit = (type: keyof Pick<PlanLimits, 'clients' | 'appointments' | 'products' | 'services'>, currentCount: number) => {
    if (isTestUser) return false; // Usuário de teste nunca atinge limite
    const limit = limits[type];
    return limit !== -1 && currentCount >= limit;
  };

  const hasFeature = (feature: keyof Omit<PlanLimits, 'clients' | 'appointments' | 'products' | 'services'>) => {
    if (isTestUser) return true; // Usuário de teste tem todas as funcionalidades
    return limits[feature];
  };

  return {
    limits,
    currentPlan: isTestUser ? 'premium' : currentPlan, // Mostrar como premium para usuário de teste
    isLimited,
    getLimit,
    hasReachedLimit,
    hasFeature,
    isTestUser, // Expor se é usuário de teste
  };
};
