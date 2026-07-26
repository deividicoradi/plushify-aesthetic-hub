// CORS restrito ao domínio real da aplicação — antes, todas as edge
// functions autenticadas (checkout, criação de assinatura, validação de
// plano/fraude, start-trial) respondiam "Access-Control-Allow-Origin: *",
// removendo a restrição de origem do navegador. Como a autenticação é via
// Bearer token (não cookie), isso não vaza sessão sozinho, mas facilita
// abuso se um token vazar (XSS em outro lugar, extensão maliciosa etc):
// qualquer site conseguiria chamar essas funções com o token roubado.
//
// buildCorsHeaders reflete de volta o Origin da requisição somente se
// ele estiver na lista permitida; caso contrário cai pro domínio de
// produção (bloqueando o header pro chamador, já que o browser não aceita
// uma resposta cujo Allow-Origin não bate com o Origin real da página).

const ALLOWED_ORIGINS = [
  'https://plushify.com.br',
  'https://www.plushify.com.br',
  'https://plushify-aesthetic-hub.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Preview do Lovable usa subdomínios dinâmicos (id-preview--*.lovableproject.com),
// não dá pra listar um por um — permite qualquer subdomínio desses dois domínios.
const ALLOWED_ORIGIN_SUFFIXES = ['.lovableproject.com', '.lovable.app'];

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === 'https:' && ALLOWED_ORIGIN_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

export function buildCorsHeaders(requestOrigin?: string | null): Record<string, string> {
  const origin = requestOrigin && isAllowedOrigin(requestOrigin)
    ? requestOrigin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  };
}
