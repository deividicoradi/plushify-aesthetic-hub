-- payments.client_id nunca teve uma foreign key para public.clients(id)
-- (diferente de appointments.client_id, que já tinha essa FK desde a
-- migration base). Sem a FK declarada, o PostgREST não consegue resolver
-- embeds do tipo `.select('..., clients(id, name)')` — toda consulta que
-- tenta isso falha com "Could not find a relationship between 'payments'
-- and 'clients'". Isso quebrava, entre outras coisas, o seletor de
-- pagamentos do diálogo "Novo Parcelamento" (InstallmentDialog), que nunca
-- conseguia carregar a lista de pagamentos pendentes/parciais.

-- Zera client_id órfãos (apontando para um cliente já excluído) antes de
-- adicionar a constraint, para a migration não falhar em dados existentes.
UPDATE public.payments p
SET client_id = NULL
WHERE p.client_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.id = p.client_id);

ALTER TABLE public.payments
  ADD CONSTRAINT payments_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
