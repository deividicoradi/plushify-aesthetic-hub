/**
 * Wrapper para integrar Supabase Client com RequestManager
 * Roteia chamadas REST do Supabase pelo requestManager
 */

import { supabase } from '@/integrations/supabase/client';
import { requestManager } from './requestManager';

// Interceptar fetch do Supabase para passar pelo requestManager
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  // Apenas interceptar chamadas para Supabase REST API
  const isSupabaseRest = url.includes('.supabase.co/rest/');
  const isSupabaseAuth = url.includes('.supabase.co/auth/');
  
  if (!isSupabaseRest && !isSupabaseAuth) {
    // Outras requisições seguem normalmente
    return originalFetch(input, init);
  }
  
  // Anti-reentrância: marcar requisições internas
  const hasNoLogHeader = init?.headers instanceof Headers 
    ? init.headers.get('x-no-log')
    : (init?.headers as Record<string, string>)?.['x-no-log'];
  
  const isInternalRequest = hasNoLogHeader === '1';
  
  try {
    const method = init?.method?.toUpperCase() || 'GET';
    const isIdempotent = method === 'GET' || method === 'HEAD';
    
    // Usar requestManager para requisições GET/HEAD idempotentes
    if (isIdempotent && !isInternalRequest) {
      const data = await requestManager.fetchJson(url, {
        method,
        headers: init?.headers as Record<string, string>,
        body: init?.body,
        signal: init?.signal,
      }, {
        ttl: 30000, // 30s cache
        staleWhileRevalidate: true,
        critical: isSupabaseAuth, // Auth é sempre crítico
      });
      
      // Simular Response para compatibilidade
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Mutations seguem pelo fetch original (requestManager não cacheia)
    return originalFetch(input, init);
    
  } catch (error: any) {
    // Converter erro para Response para compatibilidade
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message?.includes('429') ? 429 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export { supabase };
