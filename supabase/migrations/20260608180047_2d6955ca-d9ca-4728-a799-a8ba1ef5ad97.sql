
-- 1) Drop the overly-broad anon SELECT policy on services.
-- Public booking flow uses SECURITY DEFINER RPCs (get_public_services / get_public_available_slots / create_public_booking)
-- so anonymous users still get exactly the data they need without exposing the table.
DROP POLICY IF EXISTS services_public_active ON public.services;

-- 2) Lock down SECURITY DEFINER functions: revoke default PUBLIC EXECUTE,
--    then re-grant only the roles that should be able to call each one.

-- Helpers that must stay callable by anonymous visitors (public booking page):
REVOKE ALL ON FUNCTION public.get_public_services() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_services() TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_public_available_slots(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_available_slots(uuid, date) TO anon, authenticated, service_role;

REVOKE ALL ON FUNCTION public.create_public_booking(text, text, text, uuid, date, time without time zone, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_public_booking(text, text, text, uuid, date, time without time zone, text) TO anon, authenticated, service_role;

-- Account-scoped helpers: signed-in users only.
REVOKE ALL ON FUNCTION public.get_user_plan(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_plan(uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.has_feature_access(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_feature_access(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_clients_masked(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_clients_masked(boolean) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_client_data_secure(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_client_data_secure(uuid, boolean) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_professionals_secure(boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_professionals_secure(boolean) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.set_authorization_password(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_authorization_password(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.verify_authorization_password(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_authorization_password(text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_subscription(uuid, text, text, integer, text, text, timestamptz) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.check_pending_appointments_for_day(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_pending_appointments_for_day(uuid, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.check_appointment_availability(uuid, date, time without time zone, integer, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_appointment_availability(uuid, date, time without time zone, integer, uuid) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.get_available_slots(uuid, date, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_available_slots(uuid, date, integer, integer) TO authenticated, service_role;

-- Trigger / internal helpers: service_role only (triggers run as definer regardless of EXECUTE grants).
REVOKE ALL ON FUNCTION public.audit_trigger_function() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.audit_trigger_function() TO service_role;

REVOKE ALL ON FUNCTION public.clients_security_trigger() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.clients_security_trigger() TO service_role;

REVOKE ALL ON FUNCTION public.update_product_stock() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_product_stock() TO service_role;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
