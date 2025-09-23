// Circuit Breaker específico para WhatsApp para prevenir loops infinitos
// e proteger contra sobrecarga de recursos

interface CircuitBreakerConfig {
  maxFailures: number;
  cooldownMs: number;
  healthCheckIntervalMs: number;
  maxConcurrentRequests: number;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number | null;
  nextRetryTime: number | null;
  concurrentRequests: number;
  requestLog: number[];
}

class WhatsAppCircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: null,
    nextRetryTime: null,
    concurrentRequests: 0,
    requestLog: []
  };

  private config: CircuitBreakerConfig = {
    maxFailures: 3,
    cooldownMs: 30000, // 30 segundos
    healthCheckIntervalMs: 60000, // 1 minuto
    maxConcurrentRequests: 5
  };

  constructor(config?: Partial<CircuitBreakerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Verificar se pode fazer uma requisição
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Limpar log de requisições antigas (últimos 60 segundos)
    this.state.requestLog = this.state.requestLog.filter(
      timestamp => now - timestamp < 60000
    );

    // Verificar limite de requisições concorrentes
    if (this.state.concurrentRequests >= this.config.maxConcurrentRequests) {
      console.warn('[WHATSAPP-CB] ❌ Too many concurrent requests:', this.state.concurrentRequests);
      return false;
    }

    // Verificar rate limiting (máximo 10 requisições por minuto)
    if (this.state.requestLog.length >= 10) {
      console.warn('[WHATSAPP-CB] ❌ Rate limit exceeded:', this.state.requestLog.length);
      return false;
    }

    // Verificar se o circuit breaker está aberto
    if (!this.state.isOpen) {
      return true;
    }

    // Se está aberto, verificar se pode tentar novamente
    if (this.state.nextRetryTime && now >= this.state.nextRetryTime) {
      console.log('[WHATSAPP-CB] ⚡ Circuit breaker reset - allowing half-open state');
      this.state.isOpen = false;
      this.state.failureCount = 0;
      this.state.nextRetryTime = null;
      return true;
    }

    const remainingTime = this.state.nextRetryTime ? Math.ceil((this.state.nextRetryTime - now) / 1000) : 0;
    console.log(`[WHATSAPP-CB] ❌ Circuit breaker OPEN - ${remainingTime}s remaining`);
    return false;
  }

  // Registrar o início de uma requisição
  startRequest(): void {
    const now = Date.now();
    this.state.concurrentRequests++;
    this.state.requestLog.push(now);
    console.log(`[WHATSAPP-CB] 📡 Request started (concurrent: ${this.state.concurrentRequests})`);
  }

  // Registrar sucesso
  recordSuccess(): void {
    this.state.concurrentRequests = Math.max(0, this.state.concurrentRequests - 1);
    
    if (this.state.failureCount > 0 || this.state.isOpen) {
      console.log('[WHATSAPP-CB] ✅ Success - resetting failure count');
      this.state.failureCount = 0;
      this.state.isOpen = false;
      this.state.nextRetryTime = null;
    }
    
    console.log(`[WHATSAPP-CB] ✅ Request completed successfully (concurrent: ${this.state.concurrentRequests})`);
  }

  // Registrar falha
  recordFailure(error?: Error): void {
    this.state.concurrentRequests = Math.max(0, this.state.concurrentRequests - 1);
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();

    console.log(`[WHATSAPP-CB] ❌ Failure ${this.state.failureCount}/${this.config.maxFailures}:`, error?.message);

    if (this.state.failureCount >= this.config.maxFailures) {
      this.state.isOpen = true;
      this.state.nextRetryTime = Date.now() + this.config.cooldownMs;
      
      console.error(`[WHATSAPP-CB] 🔴 Circuit breaker OPENED after ${this.state.failureCount} failures. Next retry: ${new Date(this.state.nextRetryTime).toLocaleTimeString()}`);
    }
  }

  // Obter estado atual
  getState(): Readonly<CircuitBreakerState> {
    return { ...this.state };
  }

  // Reset manual do circuit breaker
  reset(): void {
    console.log('[WHATSAPP-CB] 🔄 Manual reset');
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      nextRetryTime: null,
      concurrentRequests: 0,
      requestLog: []
    };
  }

  // Obter informações para debug
  getDebugInfo(): string {
    const now = Date.now();
    const timeUntilRetry = this.state.nextRetryTime ? 
      Math.ceil((this.state.nextRetryTime - now) / 1000) : 0;
    
    return `Circuit Breaker Status:
    - State: ${this.state.isOpen ? 'OPEN' : 'CLOSED'}
    - Failures: ${this.state.failureCount}/${this.config.maxFailures}
    - Concurrent: ${this.state.concurrentRequests}/${this.config.maxConcurrentRequests}
    - Requests/min: ${this.state.requestLog.length}/10
    - Time until retry: ${timeUntilRetry}s`;
  }
}

// Singleton para garantir um único circuit breaker por aplicação
let circuitBreakerInstance: WhatsAppCircuitBreaker | null = null;

export const getWhatsAppCircuitBreaker = (): WhatsAppCircuitBreaker => {
  if (!circuitBreakerInstance) {
    circuitBreakerInstance = new WhatsAppCircuitBreaker();
    console.log('[WHATSAPP-CB] 🛡️ Circuit breaker initialized');
  }
  return circuitBreakerInstance;
};

export type { CircuitBreakerState, CircuitBreakerConfig };