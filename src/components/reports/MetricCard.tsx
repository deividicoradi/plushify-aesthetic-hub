
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

  if (loading) {
    return (
      <Card className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-muted rounded-xl"></div>
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

  const patternUrl = "data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 30c0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12 12-5.373 12-12m12-12c0-6.627-5.373-12-12-12s-12 5.373-12 12 5.373 12 12 12 12-5.373 12-12'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E";

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${colorClass} border-0 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url("${patternUrl}")` }}></div>
      
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            {/* Floating indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
          </div>
          
          {growth !== undefined && (
            <div className="text-right">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm text-white shadow-sm">
                <span className="mr-1">{growth >= 0 ? '↗' : '↙'}</span>
                {formatGrowth(growth)}
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold text-white/95 text-lg tracking-tight">{title}</h3>
          <div className="text-3xl font-bold text-white drop-shadow-sm">
            {typeof value === 'number' && title.includes('Receita') 
              ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : value.toLocaleString('pt-BR')
            }
          </div>
          <p className="text-sm text-white/80 font-medium leading-relaxed">{description}</p>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
      </CardContent>
    </Card>
  );
};
