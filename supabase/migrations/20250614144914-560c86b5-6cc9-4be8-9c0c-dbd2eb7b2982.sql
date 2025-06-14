
-- Atualizar a tabela appointments para corresponder ao tipo Appointment
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS service TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS time TEXT;

-- Atualizar a coluna status para usar os valores corretos em português
ALTER TABLE appointments 
ALTER COLUMN status SET DEFAULT 'Pendente';

-- Criar uma função para formatar a data/hora dos agendamentos
CREATE OR REPLACE FUNCTION format_appointment_time(start_time timestamp with time zone)
RETURNS text AS $$
BEGIN
  RETURN to_char(start_time, 'HH24:MI');
END;
$$ LANGUAGE plpgsql;

-- Habilitar RLS na tabela appointments se não estiver habilitado
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;

CREATE POLICY "Users can view their own appointments" 
  ON appointments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" 
  ON appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
  ON appointments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" 
  ON appointments 
  FOR DELETE 
  USING (auth.uid() = user_id);
