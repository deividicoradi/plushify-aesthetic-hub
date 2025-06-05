
import { PlanConfig } from './types.ts';

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const getPlanConfig = (planId: string, isYearly: boolean): PlanConfig => {
  switch(planId) {
    case 'starter':
      return {
        name: "Plano Starter",
        unitAmount: isYearly ? 5590 : 6990
      };
    case 'pro':
      return {
        name: "Plano Pro", 
        unitAmount: isYearly ? 9590 : 11990
      };
    case 'premium':
      return {
        name: "Plano Premium",
        unitAmount: isYearly ? 15990 : 19990
      };
    default:
      throw new Error(`Plano '${planId}' não é válido`);
  }
};
