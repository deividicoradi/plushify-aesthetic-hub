import React from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type AnalyticsPeriod =
  | 'today'
  | 'this_week'
  | 'this_month'
  | '30d'
  | '3m'
  | '6m'
  | '12m'
  | 'custom';

export interface AnalyticsDateRange {
  startDate: Date;
  endDate: Date;
  period: AnalyticsPeriod;
  label: string;
}

const OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: 'Hoje' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'this_month', label: 'Este mês' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '12m', label: 'Últimos 12 meses' },
  { value: 'custom', label: 'Período personalizado' },
];

export const computeRange = (
  period: AnalyticsPeriod,
  customStart?: Date,
  customEnd?: Date,
): AnalyticsDateRange => {
  const now = new Date();
  const label = OPTIONS.find((o) => o.value === period)?.label ?? 'Período';
  switch (period) {
    case 'today':
      return { startDate: startOfDay(now), endDate: endOfDay(now), period, label };
    case 'this_week':
      return {
        startDate: startOfWeek(now, { weekStartsOn: 0 }),
        endDate: endOfWeek(now, { weekStartsOn: 0 }),
        period,
        label,
      };
    case 'this_month':
      return { startDate: startOfMonth(now), endDate: endOfMonth(now), period, label };
    case '30d':
      return { startDate: startOfDay(subDays(now, 29)), endDate: endOfDay(now), period, label };
    case '3m':
      return { startDate: startOfDay(subMonths(now, 3)), endDate: endOfDay(now), period, label };
    case '6m':
      return { startDate: startOfDay(subMonths(now, 6)), endDate: endOfDay(now), period, label };
    case '12m':
      return { startDate: startOfDay(subMonths(now, 12)), endDate: endOfDay(now), period, label };
    case 'custom': {
      const s = customStart ? startOfDay(customStart) : startOfMonth(now);
      const e = customEnd ? endOfDay(customEnd) : endOfDay(now);
      const customLabel = `${format(s, 'dd/MM/yyyy', { locale: ptBR })} – ${format(e, 'dd/MM/yyyy', { locale: ptBR })}`;
      return { startDate: s, endDate: e, period, label: customLabel };
    }
  }
};

interface Props {
  period: AnalyticsPeriod;
  onPeriodChange: (p: AnalyticsPeriod) => void;
  customStart?: Date;
  customEnd?: Date;
  onCustomChange: (start?: Date, end?: Date) => void;
  label: string;
  className?: string;
}

export const AnalyticsPeriodFilter: React.FC<Props> = ({
  period,
  onPeriodChange,
  customStart,
  customEnd,
  onCustomChange,
  label,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={period} onValueChange={(v) => onPeriodChange(v as AnalyticsPeriod)}>
          <SelectTrigger className="h-9 w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {period === 'custom' && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn('h-9 justify-start text-left font-normal', !customStart && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customStart ? format(customStart, 'dd/MM/yyyy', { locale: ptBR }) : 'Data inicial'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customStart}
                onSelect={(d) => onCustomChange(d ?? undefined, customEnd)}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn('h-9 justify-start text-left font-normal', !customEnd && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {customEnd ? format(customEnd, 'dd/MM/yyyy', { locale: ptBR }) : 'Data final'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customEnd}
                onSelect={(d) => onCustomChange(customStart, d ?? undefined)}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>
        </>
      )}

      <span className="text-xs text-muted-foreground ml-1">{label}</span>
    </div>
  );
};