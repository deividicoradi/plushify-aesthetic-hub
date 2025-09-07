import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

// Otimizar configurações do QueryClient para melhor performance
const optimizedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1, // Reduzir tentativas
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const OptimizedSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardContent className="p-4">
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  </div>
);

interface OptimizedPerformanceWrapperProps {
  children: React.ReactNode;
}

export const OptimizedPerformanceWrapper: React.FC<OptimizedPerformanceWrapperProps> = ({ 
  children 
}) => {
  return (
    <QueryClientProvider client={optimizedQueryClient}>
      <Suspense fallback={<OptimizedSkeleton />}>
        {children}
      </Suspense>
    </QueryClientProvider>
  );
};