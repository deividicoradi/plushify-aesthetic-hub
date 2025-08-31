import React from 'react';
import { CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type PeriodOption = 
  | '7d' 
  | '30d' 
  | '90d' 
  | '6m' 
  | '1y' 
  | 'custom';

interface PeriodFilterProps {
  value: PeriodOption;
  onChange: (period: PeriodOption) => void;
  className?: string;
}

export const PeriodFilter = ({ value, onChange, className }: PeriodFilterProps) => {
  const periodOptions = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '6m', label: 'Últimos 6 meses' },
    { value: '1y', label: 'Último ano' },
    { value: 'custom', label: 'Período personalizado' }
  ];

  const getCurrentLabel = () => {
    const option = periodOptions.find(opt => opt.value === value);
    return option?.label || 'Selecionar período';
  };

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
            <Filter className="w-3 h-3" />
            {getCurrentLabel()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Período de análise</p>
            <Select value={value} onValueChange={(val) => onChange(val as PeriodOption)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};