-- Corrigir search_path nos triggers criados
DROP TRIGGER IF EXISTS wa_accounts_updated_at ON public.wa_accounts;
DROP TRIGGER IF EXISTS wa_contacts_updated_at ON public.wa_contacts;
DROP TRIGGER IF EXISTS wa_threads_updated_at ON public.wa_threads;
DROP TRIGGER IF EXISTS wa_messages_updated_at ON public.wa_messages;

CREATE OR REPLACE FUNCTION public.update_wa_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER wa_accounts_updated_at BEFORE UPDATE ON public.wa_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_wa_updated_at();

CREATE TRIGGER wa_contacts_updated_at BEFORE UPDATE ON public.wa_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_wa_updated_at();

CREATE TRIGGER wa_threads_updated_at BEFORE UPDATE ON public.wa_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_wa_updated_at();

CREATE TRIGGER wa_messages_updated_at BEFORE UPDATE ON public.wa_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_wa_updated_at();