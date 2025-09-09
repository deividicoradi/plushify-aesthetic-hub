import React, { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load charts only when needed - prevents loading on homepage
const ChartComponent = lazy(() => 
  import(/* webpackChunkName: "charts" */ '@/components/financial/charts/LoadingCharts').then(module => ({
    default: module.LoadingCharts
  }))
);

const ChartFallback = () => (
  <Card className="animate-pulse bg-card border-border">
    <CardContent className="p-6">
      <Skeleton className="h-80 w-full" />
    </CardContent>
  </Card>
);

interface LazyChartProps {
  children: React.ReactNode;
}

export const LazyChart: React.FC<LazyChartProps> = ({ children }) => {
  return (
    <Suspense fallback={<ChartFallback />}>
      {children}
    </Suspense>
  );
};