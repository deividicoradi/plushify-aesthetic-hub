/**
 * Request Manager - Central de controle de requisições
 * 
 * Funcionalidades:
 * - Single-flight / Deduplicação de requisições em voo
 * - Cache LRU para GETs (TTL 30s, máx 200 entradas)
 * - Abort controller para cancelar requisições obsoletas
 * - Backoff & retry exponencial para 429/5xx
 * - Rate limiting (60 req/min por aba)
 * - Anti-reentrância de logger
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  stale: boolean;
}

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

interface ManagerOptions {
  dedupeKey?: string;
  ttl?: number;
  staleWhileRevalidate?: boolean;
  critical?: boolean;
  noCache?: boolean;
  noDedupe?: boolean;
}

class RequestManager {
  private static instance: RequestManager;
  
  // Single-flight map: key -> Promise em voo
  private inFlightRequests = new Map<string, Promise<any>>();
  
  // Cache LRU
  private cache = new Map<string, CacheEntry>();
  private readonly MAX_CACHE_SIZE = 200;
  private readonly DEFAULT_TTL = 30000; // 30s
  
  // Rate limiting
  private requestTimestamps: number[] = [];
  private readonly RATE_WINDOW = 60000; // 60s
  private readonly RATE_LIMIT = 60; // 60 req/min
  private rateLimitPauseUntil = 0;
  
  // Stats para observabilidade
  private stats = {
    total: 0,
    cached: 0,
    deduped: 0,
    rateLimited: 0,
    retried: 0,
    aborted: 0,
  };
  
  private constructor() {
    // Limpar cache periodicamente
    setInterval(() => this.cleanupCache(), 60000);
  }
  
  static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }
  
  /**
   * Fetch centralizado com dedup, cache, retry e rate limiting
   */
  async fetchJson<T = any>(
    url: string,
    options: RequestOptions = {},
    managerOptions: ManagerOptions = {}
  ): Promise<T> {
    const {
      dedupeKey,
      ttl = this.DEFAULT_TTL,
      staleWhileRevalidate = false,
      critical = false,
      noCache = false,
      noDedupe = false,
    } = managerOptions;
    
    const method = options.method?.toUpperCase() || 'GET';
    const isIdempotent = method === 'GET' || method === 'HEAD';
    
    // Gerar chave única para a requisição
    const requestKey = dedupeKey || this.generateRequestKey(url, method, options.body);
    
    // Anti-reentrância: não logar requisições do próprio logger
    const isLoggerRequest = options.headers?.['x-no-log'] === '1';
    
    this.stats.total++;
    
    // 1. Verificar rate limiting (exceto para requisições críticas)
    if (!critical && !this.checkRateLimit()) {
      this.stats.rateLimited++;
      
      if (!isLoggerRequest && import.meta.env.DEV) {
        console.warn('[RequestManager] Rate limit pausado até', new Date(this.rateLimitPauseUntil).toLocaleTimeString());
      }
      
      // Esperar até o fim da pausa
      const waitTime = this.rateLimitPauseUntil - Date.now();
      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }
    
    // 2. Verificar cache (apenas para GETs idempotentes)
    if (isIdempotent && !noCache) {
      const cached = this.cache.get(requestKey);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        
        // Cache válido
        if (age < ttl && !cached.stale) {
          this.stats.cached++;
          if (!isLoggerRequest && import.meta.env.DEV) {
            console.log('[RequestManager] Cache HIT:', url);
          }
          return cached.data;
        }
        
        // Stale-while-revalidate: retornar cache e atualizar em background
        if (staleWhileRevalidate && age < ttl * 3) {
          if (!isLoggerRequest && import.meta.env.DEV) {
            console.log('[RequestManager] Cache STALE (revalidating):', url);
          }
          
          // Retornar cache e atualizar em background
          this.fetchAndCache(url, options, requestKey, ttl, isLoggerRequest, noDedupe).catch(() => {});
          return cached.data;
        }
      }
    }
    
    // 3. Single-flight / Deduplicação
    if (!noDedupe && this.inFlightRequests.has(requestKey)) {
      this.stats.deduped++;
      if (!isLoggerRequest && import.meta.env.DEV) {
        console.log('[RequestManager] Deduplicated request:', url);
      }
      return this.inFlightRequests.get(requestKey)!;
    }
    
    // 4. Executar requisição
    const promise = this.fetchAndCache(url, options, requestKey, ttl, isLoggerRequest, noDedupe, noCache);
    
    if (!noDedupe) {
      this.inFlightRequests.set(requestKey, promise);
    }
    
    try {
      return await promise;
    } finally {
      if (!noDedupe) {
        this.inFlightRequests.delete(requestKey);
      }
    }
  }
  
  /**
   * Executar fetch com retry e caching
   */
  private async fetchAndCache(
    url: string,
    options: RequestOptions,
    requestKey: string,
    ttl: number,
    isLoggerRequest: boolean,
    noDedupe: boolean,
    noCache = false
  ): Promise<any> {
    const method = options.method?.toUpperCase() || 'GET';
    const isIdempotent = method === 'GET' || method === 'HEAD';
    
    let lastError: Error | null = null;
    const maxRetries = 4;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Registrar request timestamp para rate limiting
        this.requestTimestamps.push(Date.now());
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json',
          },
        });
        
        // Retry em 429 (rate limit) ou 5xx (server error)
        if (response.status === 429 || response.status >= 500) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Erro 4xx (exceto 429) não tenta retry
        if (!response.ok && response.status < 500) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        // Parsear resposta
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType?.includes('application/json')) {
          const text = await response.text();
          // Truncar log de resposta em 4KB
          if (!isLoggerRequest && import.meta.env.DEV && text.length > 4096) {
            console.log('[RequestManager] Response truncated (>4KB)');
          }
          data = text ? JSON.parse(text) : null;
        } else {
          data = await response.text();
        }
        
        // Cachear se for idempotente
        if (isIdempotent && !noCache) {
          this.addToCache(requestKey, data, ttl);
        }
        
        return data;
        
      } catch (error: any) {
        lastError = error;
        
        // Aborted: não retry
        if (error.name === 'AbortError' || options.signal?.aborted) {
          this.stats.aborted++;
          throw error;
        }
        
        // Não retry em 4xx (exceto 429)
        if (error.message?.includes('HTTP 4') && !error.message?.includes('429')) {
          throw error;
        }
        
        // Última tentativa: throw
        if (attempt === maxRetries - 1) {
          throw error;
        }
        
        // Backoff exponencial com jitter
        this.stats.retried++;
        const baseDelay = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s, 8s
        const jitter = Math.random() * 500;
        const delay = Math.min(baseDelay + jitter, 8000);
        
        if (!isLoggerRequest && import.meta.env.DEV) {
          console.warn(`[RequestManager] Retry ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms:`, error.message);
        }
        
        await this.sleep(delay);
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  }
  
  /**
   * Verificar rate limit (60 req/min)
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    
    // Já está em pausa?
    if (now < this.rateLimitPauseUntil) {
      return false;
    }
    
    // Limpar timestamps antigos
    this.requestTimestamps = this.requestTimestamps.filter(
      ts => now - ts < this.RATE_WINDOW
    );
    
    // Verificar limite
    if (this.requestTimestamps.length >= this.RATE_LIMIT) {
      // Pausar por 30s
      this.rateLimitPauseUntil = now + 30000;
      
      if (import.meta.env.DEV) {
        console.warn(`[RequestManager] Rate limit atingido (${this.RATE_LIMIT}/min). Pausando 30s.`);
      }
      
      return false;
    }
    
    return true;
  }
  
  /**
   * Adicionar ao cache LRU
   */
  private addToCache(key: string, data: any, ttl: number): void {
    // Se cache cheio, remover entrada mais antiga
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      stale: false,
    });
  }
  
  /**
   * Limpar cache expirado
   */
  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = this.DEFAULT_TTL * 3; // 90s
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Gerar chave única para requisição
   */
  private generateRequestKey(url: string, method: string, body?: any): string {
    const normalizedUrl = url.split('?')[0]; // Ignorar query params variáveis
    const normalizedBody = body ? JSON.stringify(body) : '';
    return `${method}:${normalizedUrl}#${normalizedBody}`;
  }
  
  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Invalidar cache por URL
   */
  invalidateCache(urlPattern: string): void {
    for (const [key] of this.cache.entries()) {
      if (key.includes(urlPattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Limpar todo cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * Obter estatísticas
   */
  getStats() {
    return { ...this.stats };
  }
  
  /**
   * Resetar estatísticas
   */
  resetStats(): void {
    this.stats = {
      total: 0,
      cached: 0,
      deduped: 0,
      rateLimited: 0,
      retried: 0,
      aborted: 0,
    };
  }
}

// Exportar singleton
export const requestManager = RequestManager.getInstance();

// Helper para facilitar uso
export const fetchJson = <T = any>(
  url: string,
  options?: RequestOptions,
  managerOptions?: ManagerOptions
): Promise<T> => {
  return requestManager.fetchJson<T>(url, options, managerOptions);
};
