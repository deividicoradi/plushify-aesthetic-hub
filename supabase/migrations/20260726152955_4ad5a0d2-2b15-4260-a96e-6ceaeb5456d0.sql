-- Zera client_id órfãos (apontando para um cliente já excluído) antes de
-- adicionar a constraint, para a migration não falhar em dados existentes.
UPDATE public.payments p
SET client_id = NULL
WHERE p.client_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.id = p.client_id);

ALTER TABLE public.payments
  ADD CONSTRAINT payments_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;