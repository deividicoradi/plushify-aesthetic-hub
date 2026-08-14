const ABACATEPAY_HOST = 'abacatepay.com';

// Só aceita o domínio exato ou subdomínios reais (com ponto antes do
// sufixo) — hostname.endsWith('abacatepay.com') sozinho aceitaria hosts
// como "evilabacatepay.com", abrindo espaço para redirect malicioso caso
// a resposta do backend seja adulterada.
export const isValidAbacateCheckoutUrl = (url: string): boolean => {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'https:') return false;
    return hostname === ABACATEPAY_HOST || hostname.endsWith(`.${ABACATEPAY_HOST}`);
  } catch {
    return false;
  }
};
