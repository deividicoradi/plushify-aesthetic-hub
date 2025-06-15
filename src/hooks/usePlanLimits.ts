
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

  const hasFeature = (feature: keyof Omit<PlanLimits, 'clients' | 'appointments' | 'products' | 'services'>) => {
    return limits[feature];
  };

  return {
    limits,
    currentPlan,
    isLimited,
    getLimit,
    hasReachedLimit,
    hasFeature,
  };
};
