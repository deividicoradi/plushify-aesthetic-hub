
import React from 'react';

export const LoadingRewards = React.memo(() => {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="p-4 rounded-lg border border-border/50 bg-card/30 dark:bg-card/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted/50 rounded"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted/50 rounded w-24"></div>
                  <div className="h-3 bg-muted/50 rounded w-32"></div>
                </div>
              </div>
              <div className="h-5 bg-muted/50 rounded w-16"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-muted/50 rounded w-20"></div>
              <div className="h-8 bg-muted/50 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

LoadingRewards.displayName = 'LoadingRewards';
