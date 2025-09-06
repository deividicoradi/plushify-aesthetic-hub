-- Add new fields to clients table
ALTER TABLE public.clients 
ADD COLUMN cpf TEXT UNIQUE,
ADD COLUMN cep TEXT,
ADD COLUMN address TEXT,
ADD COLUMN neighborhood TEXT,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN payment_method TEXT;

-- Create index for CPF performance
CREATE INDEX idx_clients_cpf ON public.clients(cpf);

-- Add constraint to validate CPF format (11 digits)
ALTER TABLE public.clients 
ADD CONSTRAINT check_cpf_format 
CHECK (cpf IS NULL OR (cpf ~ '^[0-9]{11}$'));

-- Add constraint to validate CEP format (8 digits)
ALTER TABLE public.clients 
ADD CONSTRAINT check_cep_format 
CHECK (cep IS NULL OR (cep ~ '^[0-9]{8}$'));

-- Function to validate CPF
CREATE OR REPLACE FUNCTION validate_cpf(cpf_input TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  cpf TEXT;
  sum1 INTEGER := 0;
  sum2 INTEGER := 0;
  remainder1 INTEGER;
  remainder2 INTEGER;
  digit1 INTEGER;
  digit2 INTEGER;
  i INTEGER;
BEGIN
  -- Remove formatting and validate input
  IF cpf_input IS NULL OR LENGTH(cpf_input) != 11 THEN
    RETURN FALSE;
  END IF;
  
  cpf := cpf_input;
  
  -- Check for invalid sequences (all same digits)
  IF cpf IN ('00000000000', '11111111111', '22222222222', '33333333333', 
             '44444444444', '55555555555', '66666666666', '77777777777',
             '88888888888', '99999999999') THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate first verification digit
  FOR i IN 1..9 LOOP
    sum1 := sum1 + (CAST(SUBSTRING(cpf FROM i FOR 1) AS INTEGER) * (11 - i));
  END LOOP;
  
  remainder1 := sum1 % 11;
  IF remainder1 < 2 THEN
    digit1 := 0;
  ELSE
    digit1 := 11 - remainder1;
  END IF;
  
  -- Calculate second verification digit
  FOR i IN 1..10 LOOP
    sum2 := sum2 + (CAST(SUBSTRING(cpf FROM i FOR 1) AS INTEGER) * (12 - i));
  END LOOP;
  
  remainder2 := sum2 % 11;
  IF remainder2 < 2 THEN
    digit2 := 0;
  ELSE
    digit2 := 11 - remainder2;
  END IF;
  
  -- Verify digits
  RETURN (digit1 = CAST(SUBSTRING(cpf FROM 10 FOR 1) AS INTEGER) AND 
          digit2 = CAST(SUBSTRING(cpf FROM 11 FOR 1) AS INTEGER));
END;
$$;

-- Add trigger to validate CPF
CREATE OR REPLACE FUNCTION validate_client_cpf()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validate CPF if provided
  IF NEW.cpf IS NOT NULL AND NOT validate_cpf(NEW.cpf) THEN
    RAISE EXCEPTION 'CPF inválido';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_validate_client_cpf
  BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION validate_client_cpf();