
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ModernMetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  loading?: boolean;
  onClick?: () => void;
  limit?: number;
  currentCount?: number;
  feature?: string;
  isCurrency?: boolean;
}

export const ModernMetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  loading = false,
  onClick,
  limit,
  currentCount,
  isCurrency = false
}: ModernMetricCardProps) => {
  const isNearLimit = limit && currentCount && limit !== -1 && currentCount >= limit * 0.8;
  const hasReachedLimit = limit && currentCount && limit !== -1 && currentCount >= limit;

  const formatValue = (val: string) => {
    if (isCurrency) {
      const numValue = parseFloat(val);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(numValue);
    }
    return val;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg border p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-muted rounded-lg"></div>
          <div className="w-16 h-4 bg-muted rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="w-20 h-4 bg-muted rounded"></div>
          <div className="w-24 h-8 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-card rounded-lg border p-6 transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        onClick && "cursor-pointer",
        hasReachedLimit && "border-red-200 bg-red-50/50 dark:border-red-800/30 dark:bg-red-900/10"
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        {change && (
          <Badge variant="secondary" className="text-xs">
            +{change}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold text-foreground">{formatValue(value)}</p>
        
        {limit && limit !== -1 && (
          <div className="text-xs text-muted-foreground">
            {currentCount}/{limit}
            {isNearLimit && (
              <span className="text-orange-600 dark:text-orange-400 ml-1">
                (próximo ao limite)
              </span>
            )}
            {hasReachedLimit && (
              <span className="text-red-600 dark:text-red-400 ml-1">
                (limite atingido)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
