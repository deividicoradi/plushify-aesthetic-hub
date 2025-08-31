import { useState, useMemo } from 'react';
import { PeriodOption } from '@/components/dashboard/PeriodFilter';

export const usePeriodFilter = (initialPeriod: PeriodOption = '30d') => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(initialPeriod);

  const dateRange = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (selectedPeriod) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6m':
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1y':
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate,
      endDate: now,
      period: selectedPeriod
    };
  }, [selectedPeriod]);

  return {
    selectedPeriod,
    setSelectedPeriod,
    dateRange
  };
};