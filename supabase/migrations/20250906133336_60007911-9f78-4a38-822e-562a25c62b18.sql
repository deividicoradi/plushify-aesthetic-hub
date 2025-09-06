-- Add validity and acquisition date fields to products table
ALTER TABLE public.products 
ADD COLUMN validity_date date,
ADD COLUMN acquisition_date date;