
import { useSubscription, PlanType } from './useSubscription';

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
  },
  professional: {
    clients: -1, // unlimited
    appointments: -1, // unlimited
    products: -1, // unlimited
    services: -1, // unlimited
    hasFinancialManagement: true,
    hasAdvancedReports: true,
    hasAdvancedAnalytics: false,
    hasTeamManagement: false,
    hasAutomaticBackup: false,
    hasPrioritySupport: true,
    has24_7Support: false,
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
  },
};

export const usePlanLimits = () => {
  const { currentPlan } = useSubscription();
  
  const limits = PLAN_LIMITS[currentPlan];
  
  const isLimited = (type: keyof Pick<PlanLimits, 'clients' | 'appointments' | 'products' | 'services'>) => {
    return limits[type] !== -1;
  };
  
  const getLimit = (type: keyof Pick<PlanLimits, 'clients' | 'appointments' | 'products' | 'services'>) => {
    return limits[type];
  };
  
  const hasReachedLimit = (type: keyof Pick<PlanLimits, 'clients' | 'appointments' | 'products' | 'services'>, currentCount: number) => {
    const limit = limits[type];
    return limit !== -1 && currentCount >= limit;
  };

  return {
    limits,
    currentPlan,
    isLimited,
    getLimit,
    hasReachedLimit,
  };
};
