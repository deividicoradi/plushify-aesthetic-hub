-- ========================================
-- SECURITY FIX: Comprehensive Protection for whatsapp_contatos Table
-- ========================================
-- Issue: WhatsApp Contact Phone Numbers Could Be Harvested
-- The whatsapp_contatos table needs RESTRICTIVE policies and proper constraints
-- ========================================

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "whatsapp_contatos_optimized" ON public.whatsapp_contatos;
DROP POLICY IF EXISTS "whatsapp_contatos_select_restricted" ON public.whatsapp_contatos;
DROP POLICY IF EXISTS "whatsapp_contatos_insert_restricted" ON public.whatsapp_contatos;
DROP POLICY IF EXISTS "whatsapp_contatos_update_restricted" ON public.whatsapp_contatos;
DROP POLICY IF EXISTS "whatsapp_contatos_delete_restricted" ON public.whatsapp_contatos;

-- 2. Add NOT NULL constraint to user_id (prevent bypass)
DO $$ 
BEGIN
  ALTER TABLE public.whatsapp_contatos 
    ALTER COLUMN user_id SET NOT NULL;
EXCEPTION
  WHEN others THEN NULL; -- Ignore if already NOT NULL
END $$;

-- 3. Create RESTRICTIVE RLS policies (all must pass = AND logic)
CREATE POLICY "whatsapp_contatos_select_restricted"
  ON public.whatsapp_contatos
  AS RESTRICTIVE
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "whatsapp_contatos_insert_restricted"
  ON public.whatsapp_contatos
  AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "whatsapp_contatos_update_restricted"
  ON public.whatsapp_contatos
  AS RESTRICTIVE
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "whatsapp_contatos_delete_restricted"
  ON public.whatsapp_contatos
  AS RESTRICTIVE
  FOR DELETE
  USING (user_id = auth.uid());

-- 4. Add validation constraint (prevent invalid user_id)
DO $$
BEGIN
  ALTER TABLE public.whatsapp_contatos
    ADD CONSTRAINT whatsapp_contatos_user_id_valid 
    CHECK (user_id != '00000000-0000-0000-0000-000000000000'::uuid);
EXCEPTION
  WHEN duplicate_object THEN NULL; -- Ignore if already exists
END $$;

-- 5. Create index for RLS performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_contatos_user_id_security 
  ON public.whatsapp_contatos(user_id);

-- 6. Create secure RPC function with audit logging
CREATE OR REPLACE FUNCTION public.get_whatsapp_contatos_secure(
  p_mask_sensitive boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  nome text,
  telefone text,
  cliente_id uuid,
  ultima_interacao timestamp with time zone,
  criado_em timestamp with time zone,
  atualizado_em timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log access for security monitoring
  PERFORM public.log_whatsapp_security_event(
    v_user_id,
    'WHATSAPP_CONTATOS_ACCESS',
    NULL,
    'LOW',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'masked', p_mask_sensitive,
      'timestamp', now()
    )
  );
  
  -- Return contact data with optional masking
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.nome,
    CASE 
      WHEN p_mask_sensitive THEN 
        CASE 
          WHEN length(c.telefone) > 4 THEN 
            '***' || right(c.telefone, 4)
          ELSE 
            '***'
        END
      ELSE c.telefone 
    END AS telefone,
    c.cliente_id,
    c.ultima_interacao,
    c.criado_em,
    c.atualizado_em
  FROM public.whatsapp_contatos c
  WHERE c.user_id = v_user_id
  ORDER BY c.criado_em DESC;
END;
$$;

-- 7. Create audit trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_whatsapp_contatos_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  operation_type text;
  sensitive_changed boolean := false;
BEGIN
  -- Determine operation type
  IF TG_OP = 'DELETE' THEN
    operation_type := 'DELETE_WHATSAPP_CONTACT';
  ELSIF TG_OP = 'INSERT' THEN
    operation_type := 'CREATE_WHATSAPP_CONTACT';
  ELSIF TG_OP = 'UPDATE' THEN
    operation_type := 'UPDATE_WHATSAPP_CONTACT';
    
    -- Check if sensitive data was changed
    IF (OLD.telefone IS DISTINCT FROM NEW.telefone) OR 
       (OLD.nome IS DISTINCT FROM NEW.nome) THEN
      sensitive_changed := true;
    END IF;
  END IF;

  -- Log security event for sensitive changes
  IF auth.uid() IS NOT NULL THEN
    PERFORM public.log_whatsapp_security_event(
      auth.uid(),
      operation_type,
      NULL,
      CASE WHEN sensitive_changed THEN 'MEDIUM' ELSE 'LOW' END,
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'contato_id', COALESCE(NEW.id, OLD.id),
        'sensitive_data_changed', sensitive_changed,
        'operation', TG_OP,
        'table_name', 'whatsapp_contatos'
      )
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS audit_whatsapp_contatos_trigger ON public.whatsapp_contatos;

-- Create audit trigger
CREATE TRIGGER audit_whatsapp_contatos_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.whatsapp_contatos
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_whatsapp_contatos_changes();

-- 8. Revoke direct access from anon role
REVOKE ALL ON public.whatsapp_contatos FROM anon;

-- 9. Add table comment documenting security measures
COMMENT ON TABLE public.whatsapp_contatos IS 
'WhatsApp contacts with PII (phone numbers). Protected by:
- RESTRICTIVE RLS policies (user_id = auth.uid())
- NOT NULL constraint on user_id
- Audit logging for all operations
- Secure RPC function: get_whatsapp_contatos_secure()
NEVER query this table directly from client code. Always use the secure RPC function.';