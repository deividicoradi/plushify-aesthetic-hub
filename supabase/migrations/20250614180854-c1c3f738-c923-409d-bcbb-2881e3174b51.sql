
-- Verificar e criar políticas apenas se não existirem para INSTALLMENTS
DO $$ 
BEGIN
    -- Políticas para INSTALLMENTS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'installments' AND policyname = 'Users can view their own installments') THEN
        CREATE POLICY "Users can view their own installments" 
          ON public.installments 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'installments' AND policyname = 'Users can create their own installments') THEN
        CREATE POLICY "Users can create their own installments" 
          ON public.installments 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'installments' AND policyname = 'Users can update their own installments') THEN
        CREATE POLICY "Users can update their own installments" 
          ON public.installments 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'installments' AND policyname = 'Users can delete their own installments') THEN
        CREATE POLICY "Users can delete their own installments" 
          ON public.installments 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;

    -- Políticas para CASH_CLOSURES
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cash_closures' AND policyname = 'Users can view their own cash closures') THEN
        CREATE POLICY "Users can view their own cash closures" 
          ON public.cash_closures 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cash_closures' AND policyname = 'Users can create their own cash closures') THEN
        CREATE POLICY "Users can create their own cash closures" 
          ON public.cash_closures 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cash_closures' AND policyname = 'Users can update their own cash closures') THEN
        CREATE POLICY "Users can update their own cash closures" 
          ON public.cash_closures 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cash_closures' AND policyname = 'Users can delete their own cash closures') THEN
        CREATE POLICY "Users can delete their own cash closures" 
          ON public.cash_closures 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;

    -- Políticas para CASH_OPENINGS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cash_openings' AND policyname = 'Users can view their own cash openings') THEN
        CREATE POLICY "Users can view their own cash openings" 
          ON public.cash_openings 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cash_openings' AND policyname = 'Users can create their own cash openings') THEN
        CREATE POLICY "Users can create their own cash openings" 
          ON public.cash_openings 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cash_openings' AND policyname = 'Users can update their own cash openings') THEN
        CREATE POLICY "Users can update their own cash openings" 
          ON public.cash_openings 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cash_openings' AND policyname = 'Users can delete their own cash openings') THEN
        CREATE POLICY "Users can delete their own cash openings" 
          ON public.cash_openings 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;

    -- Políticas para EXPENSES
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can view their own expenses') THEN
        CREATE POLICY "Users can view their own expenses" 
          ON public.expenses 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can create their own expenses') THEN
        CREATE POLICY "Users can create their own expenses" 
          ON public.expenses 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can update their own expenses') THEN
        CREATE POLICY "Users can update their own expenses" 
          ON public.expenses 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'expenses' AND policyname = 'Users can delete their own expenses') THEN
        CREATE POLICY "Users can delete their own expenses" 
          ON public.expenses 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;

    -- Políticas para PAYMENT_METHODS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can view their own payment methods') THEN
        CREATE POLICY "Users can view their own payment methods" 
          ON public.payment_methods 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can create their own payment methods') THEN
        CREATE POLICY "Users can create their own payment methods" 
          ON public.payment_methods 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can update their own payment methods') THEN
        CREATE POLICY "Users can update their own payment methods" 
          ON public.payment_methods 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_methods' AND policyname = 'Users can delete their own payment methods') THEN
        CREATE POLICY "Users can delete their own payment methods" 
          ON public.payment_methods 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;

    -- Políticas para CLIENTS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can view their own clients') THEN
        CREATE POLICY "Users can view their own clients" 
          ON public.clients 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can create their own clients') THEN
        CREATE POLICY "Users can create their own clients" 
          ON public.clients 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can update their own clients') THEN
        CREATE POLICY "Users can update their own clients" 
          ON public.clients 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Users can delete their own clients') THEN
        CREATE POLICY "Users can delete their own clients" 
          ON public.clients 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Habilitar RLS nas tabelas que ainda não têm
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_closures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
