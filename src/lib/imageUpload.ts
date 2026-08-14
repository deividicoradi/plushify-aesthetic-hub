// Mantém em sincronia com o allowed_mime_types configurado nos buckets
// service-images e profile-avatars (ver migrations 20260814130000 e
// 20260814140000). A extensão do arquivo salvo vem do MIME já validado,
// nunca do nome escolhido pelo usuário — evita usar uma extensão
// arbitrária no path do Storage.
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): { ok: true; extension: string } | { ok: false; error: string } {
  const extension = ALLOWED_IMAGE_TYPES[file.type];
  if (!extension) {
    return { ok: false, error: 'Formato não suportado. Envie um PNG, JPEG, WEBP ou GIF.' };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { ok: false, error: 'A imagem deve ter no máximo 5MB.' };
  }
  return { ok: true, extension };
}
