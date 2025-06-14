
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: 'up' | 'down';
}

const MetricCard = ({ title, value, icon: Icon, trend }: MetricCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        trend === 'up' ? 'bg-green-100 dark:bg-green-800/20' : 
        trend === 'down' ? 'bg-red-100 dark:bg-red-800/20' : 
        'bg-blue-100 dark:bg-blue-800/20'
      }`}>
        <Icon className={`w-5 h-5 ${
          trend === 'up' ? 'text-green-600 dark:text-green-400' : 
          trend === 'down' ? 'text-red-600 dark:text-red-400' : 
          'text-blue-600 dark:text-blue-400'
        }`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-lg font-bold">{formatCurrency(value)}</p>
      </div>
    </div>
  );
};

export default MetricCard;
