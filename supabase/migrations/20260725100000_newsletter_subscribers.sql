-- O card "Receba novidades" no rodapé público coletava nome/e-mail e
-- mostrava "Inscrição realizada com sucesso!", mas não salvava nada em
-- lugar nenhum — os dados eram descartados na hora do submit. Cria a
-- tabela real pra sustentar essa promessa.

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers (lower(email));

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Formulário público, sem login: qualquer visitante pode se inscrever, mas
-- ninguém (nem autenticado) pode listar os e-mails de outras pessoas pela
-- API — leitura fica restrita ao service_role (ex: exportar via dashboard
-- do Supabase quando for usar numa campanha).
CREATE POLICY "anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
