
export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'premium';

export type SubscriptionInfo = {
  isSubscribed: boolean;
  tier: SubscriptionTier;
  expiresAt: Date | null;
  isLoading: boolean;
};

export type CurrentPlanInfo = {
  name: string;
  tier: SubscriptionTier;
  isSubscribed: boolean;
  expiresAt: Date | null;
};
