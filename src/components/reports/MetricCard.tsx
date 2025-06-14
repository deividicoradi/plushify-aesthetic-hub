
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
  onClick?: () => void;
}

export const MetricCard = ({ 
  title, 
  value, 
  growth, 
  icon: Icon, 
  description, 
  colorClass,
  loading = false,
  onClick 
}: MetricCardProps) => {
  const formatGrowth = (growth?: number): string => {
    if (growth === undefined || growth === null) return '';
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
              <div className="w-16 h-6 bg-muted rounded-full"></div>
            </div>
            <div className="space-y-3">
              <div className="w-32 h-5 bg-muted rounded"></div>
              <div className="w-24 h-8 bg-muted rounded"></div>
              <div className="w-40 h-4 bg-muted rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CardComponent = onClick ? 'button' : 'div';

  return (
    <Card className={`bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${
      onClick ? 'cursor-pointer hover:bg-muted/10' : ''
    }`}>
      <CardContent className="p-6">
        <CardComponent
          onClick={onClick}
          className={`w-full text-left ${
            onClick ? 'focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            
            {growth !== undefined && (
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                growth >= 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
              }`}>
                <span className="mr-1">{growth >= 0 ? '↗' : '↙'}</span>
                {formatGrowth(growth)}
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-muted-foreground text-sm">{title}</h3>
            <div className="text-2xl font-bold text-foreground">
              {typeof value === 'number' && title.includes('Receita') 
                ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                : value.toLocaleString('pt-BR')
              }
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardComponent>
      </CardContent>
    </Card>
  );
};
