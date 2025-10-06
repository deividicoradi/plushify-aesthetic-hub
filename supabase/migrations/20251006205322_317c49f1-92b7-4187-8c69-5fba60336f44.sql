-- ========================================
-- FIX: Remove SECURITY DEFINER from view
-- ========================================

-- Drop the problematic view
DROP VIEW IF EXISTS public.clients_basic;

-- Recreate without SECURITY DEFINER (views don't need it, they use RLS)
CREATE VIEW public.clients_basic AS
SELECT 
  id,
  user_id,
  name,
  status,
  created_at
FROM public.clients
WHERE user_id = auth.uid();

-- Grant access
GRANT SELECT ON public.clients_basic TO authenticated;

COMMENT ON VIEW public.clients_basic IS 'Safe view showing only non-sensitive client data. Uses RLS from underlying table.';