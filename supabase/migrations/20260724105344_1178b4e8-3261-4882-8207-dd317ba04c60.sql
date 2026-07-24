CREATE TABLE IF NOT EXISTS public.booking_links (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.booking_links TO authenticated;
GRANT ALL ON public.booking_links TO service_role;

ALTER TABLE public.booking_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê apenas o próprio link de agendamento"
  ON public.booking_links FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.slugify(p_text text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(translate(
      coalesce(p_text, ''),
      'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
      'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN'
    )),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

CREATE OR REPLACE FUNCTION public.get_or_create_booking_slug() RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_slug text;
  v_base text;
  v_candidate text;
  v_suffix int := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  SELECT slug INTO v_slug FROM public.booking_links WHERE user_id = auth.uid();
  IF v_slug IS NOT NULL THEN
    RETURN v_slug;
  END IF;

  SELECT public.slugify(u.raw_user_meta_data->>'full_name')
  INTO v_base
  FROM auth.users u
  WHERE u.id = auth.uid();

  IF v_base IS NULL OR v_base = '' THEN
    v_base := 'agendamento';
  END IF;

  v_candidate := v_base;
  LOOP
    BEGIN
      INSERT INTO public.booking_links (user_id, slug) VALUES (auth.uid(), v_candidate);
      RETURN v_candidate;
    EXCEPTION WHEN unique_violation THEN
      v_suffix := v_suffix + 1;
      v_candidate := v_base || '-' || v_suffix;
    END;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_or_create_booking_slug() TO authenticated;

DROP FUNCTION IF EXISTS public.get_public_services(uuid);

CREATE OR REPLACE FUNCTION public.get_public_services(p_slug text)
RETURNS TABLE(id uuid, name text, description text, price numeric, duration integer, category text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT user_id INTO v_user_id FROM public.booking_links WHERE slug = p_slug;
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT s.id, s.name, s.description, s.price, s.duration, s.category
  FROM public.services s
  WHERE s.active = true AND s.user_id = v_user_id
  ORDER BY s.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_services(text) TO anon, authenticated, service_role;