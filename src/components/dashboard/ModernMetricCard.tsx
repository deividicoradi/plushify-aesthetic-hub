
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernMetricCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  description: string;
  onClick?: () => void;
  gradientClass: string;
  trendUp?: boolean;
}

export const ModernMetricCard = ({
  title,
  value,
  trend,
  icon: Icon,
  description,
  onClick,
  gradientClass,
  trendUp = true
}: ModernMetricCardProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300",
        "hover:scale-105 hover:shadow-2xl",
        "bg-gradient-to-br",
        gradientClass
      )}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      {/* Floating Icon */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
        <Icon className="w-8 h-8 text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              "bg-white/20 backdrop-blur-sm text-white",
              "flex items-center gap-1"
            )}>
              <span className={cn(
                "w-2 h-2 rounded-full",
                trendUp ? "bg-green-400" : "bg-red-400"
              )} />
              {trend}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-white/90 text-sm font-medium">{title}</h3>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-white/70 text-sm">{description}</p>
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      </div>
    </div>
  );
};
