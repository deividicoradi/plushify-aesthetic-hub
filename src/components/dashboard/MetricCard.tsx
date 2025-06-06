
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  description: string;
  onClick?: () => void;
  gradientClass: string;
  tabIndex?: number;
  role?: string;
  'aria-label'?: string;
}

export const MetricCard = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  description, 
  onClick,
  gradientClass,
  tabIndex,
  role,
  'aria-label': ariaLabel
}: MetricCardProps) => {
  const CardComponent = onClick ? 'button' : 'div';
  
  return (
    <Card 
      className={`bg-gradient-to-br ${gradientClass} border-0 hover:scale-105 transition-transform duration-200 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <CardContent className="p-6">
        <CardComponent
          onClick={onClick}
          tabIndex={tabIndex}
          role={role}
          aria-label={ariaLabel}
          className={`w-full text-left ${onClick ? 'focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-white/20">
              <Icon className="w-5 h-5 text-white" />
            </div>
            {trend && (
              <span className="text-sm font-medium text-white/90 bg-white/20 px-2 py-1 rounded-full">
                {trend}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-white/90">{title}</h3>
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="text-sm text-white/80">{description}</p>
          </div>
        </CardComponent>
      </CardContent>
    </Card>
  );
};
