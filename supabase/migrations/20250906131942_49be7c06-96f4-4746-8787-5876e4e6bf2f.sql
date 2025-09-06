-- Fix audit_logs action constraint to allow required actions and prevent client creation failures
-- 1) Drop existing constraint
ALTER TABLE public.audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;

-- 2) Normalize any historic values that might conflict
UPDATE public.audit_logs SET action = 'CREATE' WHERE action = 'INSERT';

-- 3) Recreate constraint with a comprehensive allowed set
ALTER TABLE public.audit_logs
ADD CONSTRAINT audit_logs_action_check
CHECK (action IN (
  'CREATE', 'UPDATE', 'DELETE',
  'INSERT', -- kept for compatibility in case any legacy process still uses it
  'VIEW', 'LOGIN', 'LOGOUT',
  'PAYMENT', 'EXPORT', 'IMPORT',
  'BACKUP', 'RESTORE',
  'CONFIG_CHANGE', 'PERMISSION_CHANGE', 'PASSWORD_CHANGE',
  'CLEANUP',
  'UNAUTHORIZED_ACCESS_ATTEMPT'
));

-- 4) Align audit trigger function to use CREATE instead of INSERT for row inserts
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  old_data JSONB;
  new_data JSONB;
  operation_type TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    operation_type := 'DELETE';
  ELSIF TG_OP = 'INSERT' THEN
    new_data := to_jsonb(NEW);
    operation_type := 'CREATE'; -- use CREATE to match allowed actions
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
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
      'Automatic audit trigger'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;