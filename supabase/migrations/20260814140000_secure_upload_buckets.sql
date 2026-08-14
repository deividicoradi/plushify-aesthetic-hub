-- O bucket service-images (migration anterior) foi criado sem restrição de
-- tipo/tamanho no servidor — só o front checava "é imagem?" e "até 5MB?",
-- o que um atacante ignora chamando a API do Storage direto com o próprio
-- token de sessão. Sem isso no bucket, dava pra subir qualquer arquivo
-- (executável, HTML, SVG com <script>) disfarçado de foto de serviço,
-- servido depois publicamente. Trava agora no servidor.

UPDATE storage.buckets
SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
WHERE id = 'service-images';
