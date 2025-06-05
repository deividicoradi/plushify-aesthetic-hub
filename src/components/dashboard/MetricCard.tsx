
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend?: string; // Tornando opcional
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  gradientClass?: string; // ex: 'from-[#9b87f5] to-[#7E69AB]'
  tabIndex?: number;
  role?: string;
  ariaLabel?: string;
}

export const MetricCard = ({
  title,
  value,
  trend,
  description,
  icon: Icon,
  onClick,
  gradientClass = "from-[#9b87f5] to-[#7E69AB]",
  tabIndex = -1,
  role = undefined,
  ariaLabel = undefined,
}: MetricCardProps) => {
  const isTrendPositive = trend ? trend.startsWith('+') : false;

  return (
    <button
      className={`
        w-full text-left rounded-xl border shadow-sm bg-white transition-all duration-300 
        focus-visible:ring-2 focus-visible:ring-primary/80 focus-visible:outline-none 
        hover:shadow-lg hover:-translate-y-1 group
      `}
      style={{ outline: 'none' }}
      onClick={onClick}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
      type="button"
    >
      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradientClass} group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {trend && (
              <span className={`text-sm font-medium ${isTrendPositive ? "text-green-600" : "text-red-600"}`}>
                {trend}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-medium text-muted-foreground">{title}</h3>
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
};
