-- Liberar usuário deividi@teste.com como premium para testes
SELECT public.start_subscription(
  p_user_id := '24bdb102-7168-4219-a798-ee4a208edf19'::uuid,
  p_plan_code := 'premium',
  p_billing_interval := 'month',
  p_trial_days := 0,
  p_stripe_subscription_id := NULL,
  p_stripe_customer_id := NULL,
  p_current_period_end := (NOW() + INTERVAL '1 year')::timestamp with time zone
);