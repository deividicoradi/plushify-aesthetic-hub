REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) FROM anon;
REVOKE EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) TO service_role;