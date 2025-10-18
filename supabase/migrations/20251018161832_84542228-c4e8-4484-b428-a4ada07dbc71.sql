-- Fix duplicate active subscriptions issue
-- Step 1: Mark old duplicate subscriptions as cancelled (keep only the most recent active one per user)
WITH ranked_subs AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY created_at DESC, updated_at DESC
    ) as rn
  FROM public.user_subscriptions
  WHERE status IN ('active', 'trial_active')
)
UPDATE public.user_subscriptions
SET status = 'canceled',
    updated_at = now()
WHERE id IN (
  SELECT id FROM ranked_subs WHERE rn > 1
);

-- Step 2: Add a unique partial index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_subscription_per_user 
ON public.user_subscriptions (user_id) 
WHERE status IN ('active', 'trial_active');