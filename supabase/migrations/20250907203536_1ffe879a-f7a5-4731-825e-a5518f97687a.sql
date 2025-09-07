-- Fix critical security vulnerability: Anonymous access to WhatsApp infrastructure tables
-- First drop all existing policies, then create secure ones

-- 1. Fix whatsapp_metrics table policies
DROP POLICY IF EXISTS "Authenticated users can view system metrics" ON public.whatsapp_metrics;
DROP POLICY IF EXISTS "System functions can insert metrics" ON public.whatsapp_metrics;
DROP POLICY IF EXISTS "Admins can view all metrics" ON public.whatsapp_metrics;
DROP POLICY IF EXISTS "System can insert metrics" ON public.whatsapp_metrics;

-- Create secure policies for whatsapp_metrics (only authenticated users)
CREATE POLICY "Authenticated users can view metrics" 
ON public.whatsapp_metrics 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert metrics with auth" 
ON public.whatsapp_metrics 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Fix whatsapp_alerts table policies  
DROP POLICY IF EXISTS "Authenticated users can view alerts" ON public.whatsapp_alerts;
DROP POLICY IF EXISTS "System functions can manage alerts" ON public.whatsapp_alerts;
DROP POLICY IF EXISTS "System functions can update alerts" ON public.whatsapp_alerts;
DROP POLICY IF EXISTS "System can manage alerts" ON public.whatsapp_alerts;

-- Create secure policies for whatsapp_alerts (only authenticated users)
CREATE POLICY "Auth users can view alerts" 
ON public.whatsapp_alerts 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth system can insert alerts" 
ON public.whatsapp_alerts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth system can update alerts" 
ON public.whatsapp_alerts 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Fix whatsapp_health_status table policies
DROP POLICY IF EXISTS "Authenticated users can view health status" ON public.whatsapp_health_status;
DROP POLICY IF EXISTS "System functions can manage health status" ON public.whatsapp_health_status;
DROP POLICY IF EXISTS "System functions can update health status" ON public.whatsapp_health_status;
DROP POLICY IF EXISTS "System can manage health status" ON public.whatsapp_health_status;

-- Create secure policies for whatsapp_health_status (only authenticated users)
CREATE POLICY "Auth users can view health" 
ON public.whatsapp_health_status 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth system can insert health" 
ON public.whatsapp_health_status 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth system can update health" 
ON public.whatsapp_health_status 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- 4. Fix whatsapp_load_tests table policies
DROP POLICY IF EXISTS "Authenticated users can view load tests" ON public.whatsapp_load_tests;
DROP POLICY IF EXISTS "System functions can manage load tests" ON public.whatsapp_load_tests;
DROP POLICY IF EXISTS "System functions can update load tests" ON public.whatsapp_load_tests;
DROP POLICY IF EXISTS "Admins can manage load tests" ON public.whatsapp_load_tests;

-- Create secure policies for whatsapp_load_tests (only authenticated users)
CREATE POLICY "Auth users can view load tests" 
ON public.whatsapp_load_tests 
FOR SELECT 
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Auth system can insert load tests" 
ON public.whatsapp_load_tests 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Auth system can update load tests" 
ON public.whatsapp_load_tests 
FOR UPDATE 
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);