import React, { createContext, useCallback, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CacheOptimizerContextType {
  clearUserCache: () => void;
  prefetchData: () => void;
}

const CacheOptimizerContext = createContext<CacheOptimizerContextType | undefined>(undefined);

export const useCacheOptimizer = () => {
  const context = useContext(CacheOptimizerContext);
  if (!context) {
    throw new Error('useCacheOptimizer must be used within a CacheOptimizerProvider');
  }
  return context;
};

interface CacheOptimizerProviderProps {
  children: React.ReactNode;
}

export const CacheOptimizerProvider: React.FC<CacheOptimizerProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const clearUserCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    queryClient.invalidateQueries({ queryKey: ['financial-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-data'] });
  }, [queryClient]);

  const prefetchData = useCallback(async () => {
    if (!user) return;

    // Prefetch dashboard data
    await queryClient.prefetchQuery({
      queryKey: ['dashboard-data', user.id],
      staleTime: 2 * 60 * 1000,
    });
  }, [queryClient, user]);

  useEffect(() => {
    // Remover cache listeners para evitar múltiplas invalidações
    return () => {
      // Cleanup apenas, sem realtime listeners aqui
    };
  }, [user]);

  const value = useMemo(() => ({ clearUserCache, prefetchData }), [clearUserCache, prefetchData]);

  return (
    <CacheOptimizerContext.Provider value={value}>
      {children}
    </CacheOptimizerContext.Provider>
  );
};