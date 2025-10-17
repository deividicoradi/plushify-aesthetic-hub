-- Migration: Implement secure token storage using Supabase Vault
-- Part 1: Create function to securely store WhatsApp tokens in Vault

CREATE OR REPLACE FUNCTION public.store_whatsapp_token(
  p_tenant_id UUID,
  p_token TEXT
)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_name TEXT;
BEGIN
  -- Generate unique secret name for this tenant
  v_secret_name := 'whatsapp_token_' || p_tenant_id::text;
  
  -- Store token in Vault (will update if exists)
  PERFORM vault.create_secret(
    v_secret_name,
    p_token,
    'WhatsApp Business API Token'
  );
  
  RETURN v_secret_name;
END;
$$ LANGUAGE plpgsql;

-- Part 2: Create function to securely retrieve WhatsApp tokens from Vault

CREATE OR REPLACE FUNCTION public.get_whatsapp_token(
  p_tenant_id UUID
)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public, vault
AS $$
DECLARE
  v_secret_name TEXT;
  v_token TEXT;
BEGIN
  v_secret_name := 'whatsapp_token_' || p_tenant_id::text;
  
  SELECT decrypted_secret INTO v_token
  FROM vault.decrypted_secrets
  WHERE name = v_secret_name
  LIMIT 1;
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- Part 3: Add column to track vault storage

ALTER TABLE public.wa_accounts 
ADD COLUMN IF NOT EXISTS vault_secret_name TEXT;

-- Part 4: Drop existing trigger if exists, then create

DROP TRIGGER IF EXISTS warn_plaintext_token ON public.wa_accounts;

CREATE OR REPLACE FUNCTION public.prevent_plaintext_token_storage()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If token_encrypted is being set to a new value, warn (but allow for backward compatibility)
  IF NEW.token_encrypted IS DISTINCT FROM OLD.token_encrypted THEN
    RAISE WARNING 'Direct token storage is deprecated. Use store_whatsapp_token() function instead.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER warn_plaintext_token
  BEFORE UPDATE ON public.wa_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_plaintext_token_storage();

-- Part 5: Grant necessary permissions

GRANT EXECUTE ON FUNCTION public.store_whatsapp_token(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_whatsapp_token(UUID) TO authenticated;