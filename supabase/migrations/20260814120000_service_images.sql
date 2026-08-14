-- Permite anexar uma foto a cada serviço, exibida no card do serviço na
-- tela pública de agendamento (/agendar/:slug), como referência visual de
-- apps do ramo (ex: Belasis). Bucket público de leitura (a foto do serviço
-- é sempre pública, é isso que aparece pro cliente final), mas só o dono
-- do serviço pode enviar/trocar/apagar sua própria foto — path prefixado
-- por auth.uid() garante isolamento entre salões.

ALTER TABLE public.services ADD COLUMN IF NOT EXISTS image_url text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Leitura pública de fotos de serviço"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');

CREATE POLICY "Usuário envia foto do próprio serviço"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'service-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário atualiza foto do próprio serviço"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'service-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário apaga foto do próprio serviço"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'service-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- get_public_services passa a devolver também image_url.
DROP FUNCTION IF EXISTS public.get_public_services(text);

CREATE OR REPLACE FUNCTION public.get_public_services(p_slug text)
RETURNS TABLE(id uuid, name text, description text, price numeric, duration integer, category text, image_url text)
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
  SELECT s.id, s.name, s.description, s.price, s.duration, s.category, s.image_url
  FROM public.services s
  WHERE s.active = true AND s.user_id = v_user_id
  ORDER BY s.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_services(text) TO anon, authenticated, service_role;
