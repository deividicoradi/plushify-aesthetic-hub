
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export const LoadingCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="animate-pulse bg-card border-border">
          <CardContent className="p-6">
            <div className="h-80 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
