-- Enhanced security for WhatsApp message tables (simplified version)
-- This migration addresses security gaps in WhatsApp message access

-- 1. Strengthen whatsapp_messages table policies
DROP POLICY IF EXISTS "Users can manage their own WhatsApp messages" ON public.whatsapp_messages;

-- Create granular policies for whatsapp_messages
CREATE POLICY "whatsapp_messages_select_own_only"
ON public.whatsapp_messages
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "whatsapp_messages_insert_own_only"
ON public.whatsapp_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "whatsapp_messages_update_own_only"
ON public.whatsapp_messages
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "whatsapp_messages_delete_own_only"
ON public.whatsapp_messages
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- 2. Strengthen whatsapp_mensagens_temp table policies
DROP POLICY IF EXISTS "Users can create their own WhatsApp messages" ON public.whatsapp_mensagens_temp;
DROP POLICY IF EXISTS "Users can view their own WhatsApp messages" ON public.whatsapp_mensagens_temp;
DROP POLICY IF EXISTS "Users can update their own WhatsApp messages" ON public.whatsapp_mensagens_temp;
DROP POLICY IF EXISTS "Users can delete their own WhatsApp messages" ON public.whatsapp_mensagens_temp;

CREATE POLICY "whatsapp_mensagens_temp_select_own_only"
ON public.whatsapp_mensagens_temp
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "whatsapp_mensagens_temp_insert_own_only"
ON public.whatsapp_mensagens_temp
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "whatsapp_mensagens_temp_update_own_only"
ON public.whatsapp_mensagens_temp
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

CREATE POLICY "whatsapp_mensagens_temp_delete_own_only"
ON public.whatsapp_mensagens_temp
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND user_id = auth.uid()
);

-- 3. Create security audit trigger function
CREATE OR REPLACE FUNCTION public.whatsapp_security_audit()
RETURNS TRIGGER AS $$
BEGIN
  -- Log sensitive operations on WhatsApp messages
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_whatsapp_security_event(
      NEW.user_id,
      'MESSAGE_INSERT',
      COALESCE(NEW.session_id, 'unknown'),
      'LOW',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'message_id', NEW.id
      )
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    PERFORM public.log_whatsapp_security_event(
      NEW.user_id,
      'MESSAGE_UPDATE',
      COALESCE(NEW.session_id, OLD.session_id, 'unknown'),
      'MEDIUM',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'message_id', NEW.id
      )
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    PERFORM public.log_whatsapp_security_event(
      OLD.user_id,
      'MESSAGE_DELETE',
      COALESCE(OLD.session_id, 'unknown'),
      'HIGH',
      inet_client_addr(),
      NULL,
      NULL,
      jsonb_build_object(
        'operation', TG_OP,
        'table_name', TG_TABLE_NAME,
        'message_id', OLD.id
      )
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Apply the security audit trigger to message tables
DROP TRIGGER IF EXISTS whatsapp_messages_security_audit ON public.whatsapp_messages;
CREATE TRIGGER whatsapp_messages_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION public.whatsapp_security_audit();

DROP TRIGGER IF EXISTS whatsapp_mensagens_temp_security_audit ON public.whatsapp_mensagens_temp;
CREATE TRIGGER whatsapp_mensagens_temp_security_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.whatsapp_mensagens_temp
  FOR EACH ROW EXECUTE FUNCTION public.whatsapp_security_audit();

-- 4. Create a secure function to retrieve messages
CREATE OR REPLACE FUNCTION public.get_whatsapp_messages_secure(
  p_limit INTEGER DEFAULT 100,
  p_offset INTEGER DEFAULT 0,
  p_session_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  session_id TEXT,
  content TEXT,
  direction TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  message_timestamp TIMESTAMP WITH TIME ZONE,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Access denied: Authentication required';
  END IF;
  
  -- Log the access attempt
  PERFORM public.log_whatsapp_security_event(
    auth.uid(),
    'SECURE_MESSAGE_ACCESS',
    p_session_id,
    'LOW',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'limit', p_limit,
      'offset', p_offset,
      'session_filter', p_session_id IS NOT NULL
    )
  );
  
  -- Return messages with access control
  RETURN QUERY
  SELECT 
    wm.id,
    wm.session_id,
    wm.content,
    wm.direction,
    wm.contact_name,
    wm.contact_phone,
    wm.timestamp,
    wm.status
  FROM public.whatsapp_messages wm
  WHERE wm.user_id = auth.uid()
    AND (p_session_id IS NULL OR wm.session_id = p_session_id)
  ORDER BY wm.timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;