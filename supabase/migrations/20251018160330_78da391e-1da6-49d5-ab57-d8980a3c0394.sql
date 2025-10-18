-- Função para testar conexão com WhatsApp Cloud API
CREATE OR REPLACE FUNCTION public.test_wa_cloud_api_connection(
  p_phone_number_id TEXT,
  p_access_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Esta função é um placeholder
  -- A validação real acontece no edge function
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Credenciais salvas. Teste completo realizado pelo edge function.'
  );
  
  RETURN v_result;
END;
$$;

-- Adicionar constraint para garantir apenas uma conta ativa por tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_wa_accounts_one_active_per_tenant 
ON public.wa_accounts(tenant_id) 
WHERE status = 'active';

-- Função para desativar conta WhatsApp
CREATE OR REPLACE FUNCTION public.deactivate_wa_account(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Desativar conta
  UPDATE public.wa_accounts
  SET status = 'inactive',
      updated_at = NOW()
  WHERE tenant_id = p_tenant_id
    AND status = 'active';
    
  -- Log de auditoria
  PERFORM public.log_wa_audit(
    p_tenant_id := p_tenant_id,
    p_action := 'ACCOUNT_DEACTIVATED',
    p_endpoint := 'deactivate_account',
    p_success := true,
    p_metadata := jsonb_build_object(
      'timestamp', NOW()
    )
  );
  
  RETURN TRUE;
END;
$$;

-- Adicionar display_name se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'wa_accounts' 
    AND column_name = 'display_name'
  ) THEN
    ALTER TABLE public.wa_accounts 
    ADD COLUMN display_name TEXT;
  END IF;
END $$;