-- Remover índices existentes se houver
DROP INDEX IF EXISTS idx_whatsapp_sessions_user_id;
DROP INDEX IF EXISTS idx_whatsapp_sessions_session_id;
DROP INDEX IF EXISTS idx_whatsapp_sessions_status;

-- Criar tabela whatsapp_sessions para armazenar sessões WPPConnect
CREATE TABLE IF NOT EXISTS public.whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text NOT NULL UNIQUE,
  token_bcrypt text,
  status text NOT NULL DEFAULT 'desconectado',
  qr_code text,
  server_url text,
  last_activity timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON public.whatsapp_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.whatsapp_sessions;

-- RLS Policies
CREATE POLICY "Users can view own sessions"
  ON public.whatsapp_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.whatsapp_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.whatsapp_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.whatsapp_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_whatsapp_sessions_updated_at ON public.whatsapp_sessions;
DROP FUNCTION IF EXISTS update_whatsapp_sessions_updated_at();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_whatsapp_sessions_updated_at
  BEFORE UPDATE ON public.whatsapp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_sessions_updated_at();

-- Índices para performance
CREATE INDEX idx_whatsapp_sessions_user_id ON public.whatsapp_sessions(user_id);
CREATE INDEX idx_whatsapp_sessions_session_id ON public.whatsapp_sessions(session_id);
CREATE INDEX idx_whatsapp_sessions_status ON public.whatsapp_sessions(status);