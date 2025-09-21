-- Fix auth RLS initialization performance issue on professionals table

-- Remove existing policies with direct auth.uid() calls
DROP POLICY IF EXISTS "professionals_select_optimized" ON public.professionals;
DROP POLICY IF EXISTS "professionals_insert_optimized" ON public.professionals;
DROP POLICY IF EXISTS "professionals_update_optimized" ON public.professionals;
DROP POLICY IF EXISTS "professionals_delete_optimized" ON public.professionals;

-- Create optimized policies using (SELECT auth.uid()) for better performance
CREATE POLICY "professionals_select_optimized" ON public.professionals
FOR SELECT 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "professionals_insert_optimized" ON public.professionals
FOR INSERT 
TO authenticated
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "professionals_update_optimized" ON public.professionals
FOR UPDATE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())))
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

CREATE POLICY "professionals_delete_optimized" ON public.professionals
FOR DELETE 
TO authenticated
USING (((SELECT auth.uid()) IS NOT NULL) AND (user_id = (SELECT auth.uid())));

-- Log the optimization
DO $$
BEGIN
  RAISE NOTICE '[PERFORMANCE] professionals RLS policies optimized with SELECT auth.uid() ✅';
END $$;