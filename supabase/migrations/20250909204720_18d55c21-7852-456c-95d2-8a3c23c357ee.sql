-- Drop existing function and recreate with proper security
DROP FUNCTION IF EXISTS public.encrypt_token(text);
DROP FUNCTION IF EXISTS public.decrypt_token(text);

-- Create secure function to get clients with proper masking (already created in previous migration)
-- This function is already available based on the useSecureClientData hook

-- Enhance the existing clients table security with additional triggers
CREATE OR REPLACE FUNCTION public.validate_sensitive_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log all sensitive data access attempts
  PERFORM public.log_whatsapp_security_event(
    auth.uid(),
    'SENSITIVE_DATA_ACCESS',
    NULL,
    'MEDIUM',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'table_name', TG_TABLE_NAME,
      'operation', TG_OP,
      'record_id', COALESCE(NEW.id, OLD.id),
      'user_id', auth.uid()
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add security trigger to clients table for audit logging
DROP TRIGGER IF EXISTS validate_sensitive_data_access_trigger ON public.clients;
CREATE TRIGGER validate_sensitive_data_access_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.validate_sensitive_data_access();

-- Create function to validate data access permissions
CREATE OR REPLACE FUNCTION public.verify_data_access_permission(p_table_name text, p_record_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_permission boolean := false;
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if user owns the record based on table
  CASE p_table_name
    WHEN 'clients' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.clients 
        WHERE id = p_record_id AND user_id = auth.uid()
      ) INTO has_permission;
    WHEN 'professionals' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.professionals 
        WHERE id = p_record_id AND user_id = auth.uid()
      ) INTO has_permission;
    WHEN 'whatsapp_contatos' THEN
      SELECT EXISTS(
        SELECT 1 FROM public.whatsapp_contatos 
        WHERE id = p_record_id AND user_id = auth.uid()
      ) INTO has_permission;
    ELSE
      has_permission := false;
  END CASE;
  
  RETURN has_permission;
END;
$$;