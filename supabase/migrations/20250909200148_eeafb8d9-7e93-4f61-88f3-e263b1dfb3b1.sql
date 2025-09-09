-- Enhanced security for WhatsApp message tables (corrected version)
-- This migration addresses potential security gaps in WhatsApp message access

-- 1. Strengthen whatsapp_messages table policies
DROP POLICY IF EXISTS "Users can manage their own WhatsApp messages" ON public.whatsapp_messages;

-- Create more granular policies for whatsapp_messages
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

-- 3. Create security audit trigger function for message operations
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
        'message_id', NEW.id,
        'changed_fields', to_jsonb(NEW) - to_jsonb(OLD)
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

-- 4. Create a secure function to retrieve messages with built-in access control
CREATE OR REPLACE FUNCTION public.get_whatsapp_messages_secure(
  p_user_id UUID DEFAULT auth.uid(),
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
  timestamp TIMESTAMP WITH TIME ZONE,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Verify user can only access their own messages
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Cannot access other users messages';
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
  WHERE wm.user_id = p_user_id
    AND (p_session_id IS NULL OR wm.session_id = p_session_id)
  ORDER BY wm.timestamp DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- 5. Create additional security constraints
-- Add check constraints to prevent malicious data
ALTER TABLE public.whatsapp_messages
ADD CONSTRAINT IF NOT EXISTS whatsapp_messages_content_length_check 
CHECK (length(content) <= 10000);

ALTER TABLE public.whatsapp_mensagens_temp
ADD CONSTRAINT IF NOT EXISTS whatsapp_mensagens_temp_content_length_check 
CHECK (length(conteudo) <= 10000);

-- 6. Create a secure message deletion function with audit trail
CREATE OR REPLACE FUNCTION public.delete_whatsapp_messages_secure(
  p_message_ids UUID[],
  p_reason TEXT DEFAULT 'user_request'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count INTEGER := 0;
  msg_id UUID;
BEGIN
  -- Verify all messages belong to the current user
  FOR msg_id IN SELECT unnest(p_message_ids) LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.whatsapp_messages 
      WHERE id = msg_id AND user_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Access denied: Message % does not belong to user', msg_id;
    END IF;
  END LOOP;
  
  -- Log the deletion request
  PERFORM public.log_whatsapp_security_event(
    auth.uid(),
    'BULK_MESSAGE_DELETION',
    NULL,
    'MEDIUM',
    inet_client_addr(),
    NULL,
    NULL,
    jsonb_build_object(
      'message_count', array_length(p_message_ids, 1),
      'reason', p_reason,
      'message_ids', p_message_ids
    )
  );
  
  -- Perform the deletion
  DELETE FROM public.whatsapp_messages 
  WHERE id = ANY(p_message_ids) AND user_id = auth.uid();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;