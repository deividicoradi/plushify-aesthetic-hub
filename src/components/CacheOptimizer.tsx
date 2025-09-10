import React, { createContext, useContext, useEffect, ReactNode } from 'react';
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

  const clearUserCache = () => {
    queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
    queryClient.invalidateQueries({ queryKey: ['financial-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-data'] });
  };

  const prefetchData = async () => {
    if (!user) return;

    // Prefetch dashboard data
    await queryClient.prefetchQuery({
      queryKey: ['dashboard-data', user.id],
      staleTime: 2 * 60 * 1000,
    });
  };

  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;
    let cacheChannel: any;
    
    const debouncedInvalidate = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        clearUserCache();
      }, 10000); // Aguardar 10 segundos antes de invalidar cache
    };

    if (user) {
      // Listen to real-time changes and intelligently invalidate cache
      cacheChannel = supabase
        .channel('cache-invalidation')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `user_id=eq.${user.id}`
          },
          debouncedInvalidate
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `user_id=eq.${user.id}`
          },
          debouncedInvalidate
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `user_id=eq.${user.id}`
          },
          debouncedInvalidate
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'expenses',
            filter: `user_id=eq.${user.id}`
          },
          debouncedInvalidate
        )
        .subscribe();
    }

    return () => {
      clearTimeout(refreshTimeout);
      if (cacheChannel) {
        supabase.removeChannel(cacheChannel);
      }
    };
  }, [user]);

  return (
    <CacheOptimizerContext.Provider value={{ clearUserCache, prefetchData }}>
      {children}
    </CacheOptimizerContext.Provider>
  );
};