
-- Remover todas as políticas RLS da tabela appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;

-- Remover a função format_appointment_time se existir
DROP FUNCTION IF EXISTS format_appointment_time(timestamp with time zone);

-- Remover a tabela appointments completamente
DROP TABLE IF EXISTS appointments CASCADE;
