// Achado F3 da auditoria de segurança de 2026-08-29 (docs/security-audit/):
// campos de texto livre (ex: social_link de prospects) renderizados direto
// em href sem checar o esquema permitem que um valor como "javascript:..."
// execute ao ser clicado. isSafeUrl restringe a esquemas inofensivos antes
// de qualquer valor de usuário virar href/src.
const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

export function isSafeUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    // URLs sem esquema (ex: "instagram.com/foo") são tratadas como http(s) —
    // o browser resolveria como relativa, o que também não é o que queremos
    // aqui, então exigimos um esquema explícito e seguro.
    const url = new URL(value);
    return ALLOWED_PROTOCOLS.has(url.protocol);
  } catch {
    return false;
  }
}
