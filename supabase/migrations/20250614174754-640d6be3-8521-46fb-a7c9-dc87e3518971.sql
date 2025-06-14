
-- Create a table for cash openings
CREATE TABLE public.cash_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  opening_date DATE NOT NULL,
  opening_balance NUMERIC NOT NULL DEFAULT 0,
  cash_amount NUMERIC NOT NULL DEFAULT 0,
  card_amount NUMERIC NOT NULL DEFAULT 0,
  pix_amount NUMERIC NOT NULL DEFAULT 0,
  other_amount NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.cash_openings ENABLE ROW LEVEL SECURITY;

-- Create policies for cash openings
CREATE POLICY "Users can view their own cash openings" 
  ON public.cash_openings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cash openings" 
  ON public.cash_openings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cash openings" 
  ON public.cash_openings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cash openings" 
  ON public.cash_openings 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at column
CREATE TRIGGER update_cash_openings_updated_at
  BEFORE UPDATE ON public.cash_openings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
