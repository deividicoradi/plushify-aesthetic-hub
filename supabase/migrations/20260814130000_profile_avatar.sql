-- Permite o usuário colocar uma foto de perfil na conta/configurações.
-- Bucket separado do de serviços (isolamento por finalidade), mesma
-- estratégia: leitura pública, mas só o próprio dono (path prefixado por
-- auth.uid()) pode enviar/trocar/apagar sua foto.
--
-- allowed_mime_types e file_size_limit são aplicados pelo próprio Storage
-- no servidor — a checagem de tipo/tamanho no front é só UX, um atacante
-- pode chamar a API do Storage direto e ignorá-la. Sem isso, um usuário
-- autenticado poderia subir qualquer arquivo (executável, HTML, SVG com
-- <script>) disfarçado de foto, servido depois publicamente pelo bucket.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-avatars', 'profile-avatars', true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Leitura pública de foto de perfil"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-avatars');

CREATE POLICY "Usuário envia a própria foto de perfil"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário atualiza a própria foto de perfil"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Usuário apaga a própria foto de perfil"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
