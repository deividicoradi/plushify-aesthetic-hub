import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

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
  // Uses the app-level QueryClientProvider. Only provides a Suspense fallback here.
  return (
    <Suspense fallback={<OptimizedSkeleton />}>
      {children}
    </Suspense>
  );
};