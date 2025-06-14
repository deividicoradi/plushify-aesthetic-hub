
import React, { useState } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { useReportsData } from '@/hooks/financial/useReportsData';
import { ReportFilters } from './reports/ReportFilters';
import { ReportSummary } from './reports/ReportSummary';
import { GenerateReportButton } from './reports/GenerateReportButton';
import { ReportPreview } from './reports/ReportPreview';

const ReportsTab = () => {
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [reportType, setReportType] = useState<string>('consolidado');

  const { data: reportData, isLoading } = useReportsData(dateFrom, dateTo, reportType);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
        <p className="text-muted-foreground">
          Gere relatórios detalhados em PDF com filtros personalizados
        </p>
      </div>

      <ReportFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        reportType={reportType}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onReportTypeChange={setReportType}
      />

      {reportData && <ReportSummary reportData={reportData} />}

      <GenerateReportButton
        reportData={reportData}
        reportType={reportType}
        isLoading={isLoading}
      />

      {reportData && (
        <ReportPreview reportData={reportData} reportType={reportType} />
      )}
    </div>
  );
};

export default ReportsTab;
