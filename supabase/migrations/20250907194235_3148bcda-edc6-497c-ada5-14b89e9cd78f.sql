-- Enhanced security measures for clients table
-- Add additional validation trigger for sensitive data

-- Create enhanced data validation function
CREATE OR REPLACE FUNCTION public.enhanced_client_validation()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate email format if provided
  IF NEW.email IS NOT NULL AND NEW.email != '' AND NOT public.validate_email(NEW.email) THEN
    RAISE EXCEPTION 'Formato de email inválido';
  END IF;
  
  -- Validate phone format if provided  
  IF NEW.phone IS NOT NULL AND NEW.phone != '' AND NOT public.validate_phone(NEW.phone) THEN
    RAISE EXCEPTION 'Formato de telefone inválido';
  END IF;
  
  -- Ensure sensitive data is properly sanitized
  IF NEW.cpf IS NOT NULL THEN
    NEW.cpf := regexp_replace(NEW.cpf, '[^0-9]', '', 'g');
  END IF;
  
  IF NEW.cep IS NOT NULL THEN
    NEW.cep := regexp_replace(NEW.cep, '[^0-9-]', '', 'g');
  END IF;
  
  -- Limit address field lengths for security
  IF length(NEW.address) > 255 THEN
    NEW.address := left(NEW.address, 255);
  END IF;
  
  IF length(NEW.neighborhood) > 100 THEN
    NEW.neighborhood := left(NEW.neighborhood, 100);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for enhanced validation
DROP TRIGGER IF EXISTS enhanced_client_validation_trigger ON public.clients;
CREATE TRIGGER enhanced_client_validation_trigger
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.enhanced_client_validation();

-- Add function to encrypt sensitive data at rest (for future use)
CREATE OR REPLACE FUNCTION public.mask_sensitive_client_data(client_data jsonb)
RETURNS jsonb AS $$
BEGIN
  -- Mask CPF for logs (show only first 3 and last 2 digits)
  IF client_data ? 'cpf' AND client_data->>'cpf' IS NOT NULL THEN
    client_data := jsonb_set(
      client_data,
      '{cpf}',
      to_jsonb(
        CASE 
          WHEN length(client_data->>'cpf') >= 11 THEN 
            substring(client_data->>'cpf' from 1 for 3) || '***.**' || substring(client_data->>'cpf' from 10 for 2)
          ELSE '***'
        END
      )
    );
  END IF;
  
  -- Mask email (show only first char and domain)
  IF client_data ? 'email' AND client_data->>'email' IS NOT NULL THEN
    client_data := jsonb_set(
      client_data,
      '{email}',
      to_jsonb(
        substring(client_data->>'email' from 1 for 1) || '***@' || 
        substring(client_data->>'email' from position('@' in client_data->>'email') + 1)
      )
    );
  END IF;
  
  -- Mask phone (show only last 4 digits)
  IF client_data ? 'phone' AND client_data->>'phone' IS NOT NULL THEN
    client_data := jsonb_set(
      client_data,
      '{phone}',
      to_jsonb('***-' || right(client_data->>'phone', 4))
    );
  END IF;
  
  RETURN client_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enhanced audit trigger with data masking
CREATE OR REPLACE FUNCTION public.secure_client_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  operation_type TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := public.mask_sensitive_client_data(to_jsonb(OLD));
    operation_type := 'DELETE';
  ELSIF TG_OP = 'INSERT' THEN
    new_data := public.mask_sensitive_client_data(to_jsonb(NEW));
    operation_type := 'CREATE';
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := public.mask_sensitive_client_data(to_jsonb(OLD));
    new_data := public.mask_sensitive_client_data(to_jsonb(NEW));
    operation_type := 'UPDATE';
  END IF;

  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (
      user_id,
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      reason
    ) VALUES (
      auth.uid(),
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      operation_type,
      old_data,
      new_data,
      'Secure audit with masked data'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Replace existing audit trigger with secure version
DROP TRIGGER IF EXISTS audit_clients_trigger ON public.clients;
CREATE TRIGGER secure_audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.secure_client_audit_trigger();

-- Add index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_clients_user_id_status ON public.clients(user_id, status) WHERE status = 'Ativo';

-- Create security function to validate client data access
CREATE OR REPLACE FUNCTION public.validate_client_access(client_id uuid, requesting_user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Verify user owns this client record
  RETURN EXISTS (
    SELECT 1 FROM public.clients 
    WHERE id = client_id 
    AND user_id = requesting_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;