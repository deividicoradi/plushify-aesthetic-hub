import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitState {
  requests: number;
  windowStart: number;
  blocked: boolean;
  resetTime: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const {
    maxRequests,
    windowMs,
    message = 'Muitas tentativas. Tente novamente em alguns instantes.',
    skipSuccessfulRequests = false
  } = config;

  const { toast } = useToast();
  const [state, setState] = useState<RateLimitState>({
    requests: 0,
    windowStart: Date.now(),
    blocked: false,
    resetTime: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const isAllowed = useCallback((): boolean => {
    const now = Date.now();
    
    // Resetar janela se passou o tempo limite
    if (now - state.windowStart >= windowMs) {
      setState(prev => ({
        ...prev,
        requests: 0,
        windowStart: now,
        blocked: false,
        resetTime: 0
      }));
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      return true;
    }

    // Verificar se já passou do limite
    if (state.requests >= maxRequests) {
      const resetTime = state.windowStart + windowMs;
      
      setState(prev => ({
        ...prev,
        blocked: true,
        resetTime
      }));

      // Mostrar toast apenas na primeira vez que é bloqueado
      if (!state.blocked) {
        const waitTime = Math.ceil((resetTime - now) / 1000);
        toast({
          title: "Limite Excedido",
          description: `${message} Aguarde ${waitTime} segundos.`,
          variant: "destructive"
        });

        // Configurar desbloqueio automático
        timeoutRef.current = setTimeout(() => {
          setState(prev => ({
            ...prev,
            requests: 0,
            windowStart: Date.now(),
            blocked: false,
            resetTime: 0
          }));
        }, resetTime - now);
      }

      return false;
    }

    return true;
  }, [state, windowMs, maxRequests, message, toast]);

  const attempt = useCallback((success: boolean = true): boolean => {
    if (!isAllowed()) {
      return false;
    }

    // Incrementar contador apenas se não deve pular sucessos ou se falhou
    if (!skipSuccessfulRequests || !success) {
      setState(prev => ({
        ...prev,
        requests: prev.requests + 1
      }));
    }

    return true;
  }, [isAllowed, skipSuccessfulRequests]);

  const reset = useCallback(() => {
    setState({
      requests: 0,
      windowStart: Date.now(),
      blocked: false,
      resetTime: 0
    });
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const getRemainingTime = useCallback((): number => {
    if (!state.blocked) return 0;
    return Math.max(0, Math.ceil((state.resetTime - Date.now()) / 1000));
  }, [state.blocked, state.resetTime]);

  return {
    isAllowed,
    attempt,
    reset,
    blocked: state.blocked,
    requests: state.requests,
    maxRequests,
    remainingTime: getRemainingTime(),
    remainingRequests: Math.max(0, maxRequests - state.requests)
  };
};