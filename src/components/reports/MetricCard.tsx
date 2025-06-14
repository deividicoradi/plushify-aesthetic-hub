
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  growth?: number;
  icon: LucideIcon;
  description: string;
  colorClass: string;
  loading?: boolean;
}

export const MetricCard = ({ 
  title, 
  value, 
  growth, 
  icon: Icon, 
  description, 
  colorClass,
  loading = false 
}: MetricCardProps) => {
  const formatGrowth = (growth?: number): string => {
    if (growth === undefined || growth === null) return '';
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  const getGrowthColor = (growth?: number): string => {
    if (growth === undefined || growth === null) return 'text-muted-foreground';
    return growth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br ${colorClass} border-0 hover:scale-105 transition-transform duration-200`}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-white/20">
                <div className="w-5 h-5 bg-white/40 rounded"></div>
              </div>
              <div className="w-12 h-4 bg-white/20 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-white/20 rounded"></div>
              <div className="w-16 h-8 bg-white/20 rounded"></div>
              <div className="w-32 h-3 bg-white/20 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${colorClass} border-0 hover:scale-105 transition-transform duration-200`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-white/20">
            <Icon className="w-5 h-5 text-white" />
          </div>
          {growth !== undefined && (
            <span className={`text-sm font-medium text-white/90 bg-white/20 px-2 py-1 rounded-full`}>
              {formatGrowth(growth)}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-white/90">{title}</h3>
          <p className="text-2xl font-semibold text-white">
            {typeof value === 'number' && title.includes('Receita') 
              ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : value.toLocaleString('pt-BR')
            }
          </p>
          <p className="text-sm text-white/80">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
