-- ========================================
-- CRITICAL SECURITY FIXES - Phase 1 (Revised)
-- ========================================

-- 1. Create Role-Based Access Control System
-- ========================================

-- Create app_role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TABLE(role public.app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id;
$$;

-- RLS policies for user_roles table
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can grant roles" ON public.user_roles;
CREATE POLICY "Admins can grant roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can revoke roles" ON public.user_roles;
CREATE POLICY "Admins can revoke roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Fix WhatsApp Logs Public Access (CRITICAL)
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "whatsapp_logs_select_optimized" ON public.whatsapp_logs;
DROP POLICY IF EXISTS "Users can view their own logs" ON public.whatsapp_logs;
DROP POLICY IF EXISTS "Admins can view all logs" ON public.whatsapp_logs;
DROP POLICY IF EXISTS "System can insert logs" ON public.whatsapp_logs;
DROP POLICY IF EXISTS "System can insert security logs" ON public.whatsapp_security_logs;
DROP POLICY IF EXISTS "Users can view their own security logs" ON public.whatsapp_security_logs;

-- Create secure policies for whatsapp_security_logs (correct table name)
CREATE POLICY "Users can view their own security logs"
ON public.whatsapp_security_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all security logs"
ON public.whatsapp_security_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert security logs"
ON public.whatsapp_security_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Add RLS to whatsapp_rate_limits (CRITICAL)
-- ========================================

-- Enable RLS if not already enabled
ALTER TABLE public.whatsapp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate
DROP POLICY IF EXISTS "Users can view their own rate limits" ON public.whatsapp_rate_limits;
DROP POLICY IF EXISTS "Admins can view all rate limits" ON public.whatsapp_rate_limits;
DROP POLICY IF EXISTS "System can insert rate limits" ON public.whatsapp_rate_limits;
DROP POLICY IF EXISTS "Users can update their own rate limits" ON public.whatsapp_rate_limits;
DROP POLICY IF EXISTS "Admins can update all rate limits" ON public.whatsapp_rate_limits;

-- Create policies for rate limits
CREATE POLICY "Users can view their own rate limits"
ON public.whatsapp_rate_limits
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all rate limits"
ON public.whatsapp_rate_limits
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert rate limits"
ON public.whatsapp_rate_limits
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own rate limits"
ON public.whatsapp_rate_limits
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can update all rate limits"
ON public.whatsapp_rate_limits
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Enhanced Client Data Protection
-- ========================================

-- Create secure function for admin client access with full PII
CREATE OR REPLACE FUNCTION public.get_client_data_admin(p_client_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  cep TEXT,
  status TEXT,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_visit TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify admin role
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Log admin access to PII
  PERFORM public.log_whatsapp_security_event(
    auth.uid(),
    'ADMIN_CLIENT_ACCESS',
    NULL,
    'MEDIUM',
    NULL,
    NULL,
    NULL,
    jsonb_build_object(
      'client_id', p_client_id,
      'access_type', 'full_pii',
      'timestamp', now()
    )
  );
  
  -- Return full client data
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    c.cpf,
    c.address,
    c.neighborhood,
    c.city,
    c.state,
    c.cep,
    c.status,
    c.payment_method,
    c.created_at,
    c.updated_at,
    c.last_visit
  FROM public.clients c
  WHERE c.id = p_client_id;
END;
$$;

-- 6. Audit logging for role changes
-- ========================================

CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_whatsapp_security_event(
      NEW.user_id,
      'ROLE_GRANTED',
      NULL,
      'HIGH',
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'role', NEW.role,
        'granted_by', NEW.granted_by,
        'timestamp', now()
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_whatsapp_security_event(
      OLD.user_id,
      'ROLE_REVOKED',
      NULL,
      'HIGH',
      NULL,
      NULL,
      NULL,
      jsonb_build_object(
        'role', OLD.role,
        'revoked_by', auth.uid(),
        'timestamp', now()
      )
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS audit_role_changes_trigger ON public.user_roles;
CREATE TRIGGER audit_role_changes_trigger
AFTER INSERT OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_role_changes();

-- 7. Create helper function to initialize first admin
-- ========================================

CREATE OR REPLACE FUNCTION public.initialize_first_admin(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if no admins exist yet
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role, granted_by)
    VALUES (p_user_id, 'admin', p_user_id);
    
    -- Log the initialization
    PERFORM public.log_whatsapp_security_event(
      p_user_id,
      'FIRST_ADMIN_INITIALIZED',
      NULL,
      'CRITICAL',
      NULL,
      NULL,
      NULL,
      jsonb_build_object('timestamp', now())
    );
  ELSE
    RAISE EXCEPTION 'Admin users already exist. Use proper admin role grant process.';
  END IF;
END;
$$;