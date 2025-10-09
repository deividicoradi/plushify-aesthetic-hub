/**
 * Hook para debounce de buscas/filtros com abort de requisições antigas
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface DebounceSearchOptions {
  delay?: number;
  minLength?: number;
}

export const useDebounceSearch = <T,>(
  searchFn: (term: string, signal: AbortSignal) => Promise<T>,
  options: DebounceSearchOptions = {}
) => {
  const { delay = 400, minLength = 0 } = options;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  // Debounce do termo de busca
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay]);
  
  // Executar busca quando termo debounced muda
  useEffect(() => {
    if (debouncedTerm.length < minLength) {
      setResults(null);
      return;
    }
    
    // Abortar busca anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Criar novo AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    const executeSearch = async () => {
      setIsSearching(true);
      setError(null);
      
      try {
        const result = await searchFn(debouncedTerm, abortController.signal);
        
        if (!abortController.signal.aborted) {
          setResults(result);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && !abortController.signal.aborted) {
          setError(err);
          console.error('[DebounceSearch] Error:', err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    };
    
    executeSearch();
    
    return () => {
      abortController.abort();
    };
  }, [debouncedTerm, minLength, searchFn]);
  
  // Limpar busca
  const clear = useCallback(() => {
    setSearchTerm('');
    setDebouncedTerm('');
    setResults(null);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);
  
  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    results,
    error,
    clear,
  };
};
