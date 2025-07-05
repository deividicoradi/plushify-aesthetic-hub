import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface RetryConfig {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean; // Exponential backoff
  showToast?: boolean;
}

interface RetryState {
  isLoading: boolean;
  attempts: number;
  error: Error | null;
}

export const useRetry = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  config: RetryConfig = {}
) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    showToast = true
  } = config;

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    attempts: 0,
    error: null
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executeWithRetry = useCallback(async (...args: T): Promise<R> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setState(prev => ({ ...prev, attempts: attempt }));
        
        const result = await fn(...args);
        
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: null 
        }));
        
        if (showToast && attempt > 1) {
          toast({
            title: "Sucesso!",
            description: `Operação realizada com sucesso após ${attempt} tentativas.`
          });
        }
        
        return result;
      } catch (error) {
        const isLastAttempt = attempt === maxAttempts;
        const errorObj = error instanceof Error ? error : new Error(String(error));
        
        setState(prev => ({ ...prev, error: errorObj }));
        
        if (isLastAttempt) {
          setState(prev => ({ ...prev, isLoading: false }));
          
          if (showToast) {
            toast({
              title: "Erro",
              description: `Falha após ${maxAttempts} tentativas: ${errorObj.message}`,
              variant: "destructive"
            });
          }
          
          throw errorObj;
        }
        
        // Calcular delay com backoff exponencial
        const currentDelay = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        
        if (showToast && attempt > 1) {
          toast({
            title: "Tentando novamente...",
            description: `Tentativa ${attempt} falhou. Tentando novamente em ${currentDelay/1000}s...`
          });
        }
        
        await sleep(currentDelay);
      }
    }
    
    throw new Error('Unexpected end of retry loop');
  }, [fn, maxAttempts, delay, backoff, showToast]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      attempts: 0,
      error: null
    });
  }, []);

  return {
    ...state,
    execute: executeWithRetry,
    reset
  };
};