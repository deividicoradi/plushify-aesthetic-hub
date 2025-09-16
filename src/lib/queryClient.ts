import { QueryCache, QueryClient } from '@tanstack/react-query';

// Singleton QueryClient for the whole app
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Controlled logging for visibility without noise
      const key = Array.isArray(query.queryKey) ? query.queryKey.join(':') : String(query.queryKey);
      console.warn('[RQ][Error]', key, error instanceof Error ? error.message : error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min
      gcTime: 5 * 60_000, // 5 min
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
