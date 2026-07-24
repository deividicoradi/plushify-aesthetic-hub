-- Anotações não podiam ser vinculadas a nenhum cliente (não existia client_id
-- em lugar nenhum do schema). Adiciona o vínculo opcional para permitir
-- registrar observações sobre um cliente específico, mantendo notas "soltas"
-- (sem cliente) continuando válidas.

ALTER TABLE public.notes
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_notes_client_id ON public.notes(client_id) WHERE client_id IS NOT NULL;
