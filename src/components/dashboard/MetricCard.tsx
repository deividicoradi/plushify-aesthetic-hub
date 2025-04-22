
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  description: string;
  icon: LucideIcon;
}

export const MetricCard = ({
  title,
  value,
  trend,
  description,
  icon: Icon
}: MetricCardProps) => {
  const isTrendPositive = trend.startsWith('+');

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-plush-50 rounded-lg">
            <Icon className="w-5 h-5 text-plush-600" />
          </div>
          <span className={`text-sm font-medium ${
            isTrendPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend}
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-muted-foreground">{title}</h3>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};
