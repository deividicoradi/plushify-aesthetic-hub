-- Add operator and machine fields to cash_openings and cash_closures tables
ALTER TABLE public.cash_openings 
ADD COLUMN operator_id uuid REFERENCES auth.users(id),
ADD COLUMN machine_id text;

ALTER TABLE public.cash_closures 
ADD COLUMN operator_id uuid REFERENCES auth.users(id),
ADD COLUMN machine_id text;