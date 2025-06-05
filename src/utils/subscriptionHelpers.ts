
import { SubscriptionTier } from '@/types/subscription';

export const hasFeature = (userTier: SubscriptionTier, requiredTier: SubscriptionTier): boolean => {
  const tierLevels = {
    'free': 0,
    'starter': 1,
    'pro': 2,
    'premium': 3
  };
  
  return tierLevels[userTier] >= tierLevels[requiredTier];
};

export const getPlanName = (tier: SubscriptionTier): string => {
  const planNames = {
    free: 'Gratuito',
    starter: 'Starter',
    pro: 'Pro',
    premium: 'Premium'
  };
  
  return planNames[tier];
};

export const getCurrentPlanInfo = (
  tier: SubscriptionTier,
  isSubscribed: boolean,
  expiresAt: Date | null
) => {
  return {
    name: getPlanName(tier),
    tier,
    isSubscribed,
    expiresAt
  };
};
