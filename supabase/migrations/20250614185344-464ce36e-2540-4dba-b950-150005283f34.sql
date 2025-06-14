
-- Adicionar coluna installments à tabela payments
ALTER TABLE public.payments 
ADD COLUMN installments INTEGER NOT NULL DEFAULT 1;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN public.payments.installments IS 'Número de parcelas para pagamentos parcelados (cartão de crédito)';
