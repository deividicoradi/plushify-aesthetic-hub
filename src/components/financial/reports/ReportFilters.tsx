
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ReportFiltersProps {
  dateFrom: Date;
  dateTo: Date;
  reportType: string;
  onDateFromChange: (date: Date) => void;
  onDateToChange: (date: Date) => void;
  onReportTypeChange: (type: string) => void;
}

export const ReportFilters = ({
  dateFrom,
  dateTo,
  reportType,
  onDateFromChange,
  onDateToChange,
  onReportTypeChange
}: ReportFiltersProps) => {
  const setQuickPeriod = (period: string) => {
    const today = new Date();
    switch (period) {
      case 'thisMonth':
        onDateFromChange(startOfMonth(today));
        onDateToChange(endOfMonth(today));
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        onDateFromChange(startOfMonth(lastMonth));
        onDateToChange(endOfMonth(lastMonth));
        break;
      case 'thisYear':
        onDateFromChange(startOfYear(today));
        onDateToChange(endOfYear(today));
        break;
      case 'lastYear':
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        onDateFromChange(startOfYear(lastYear));
        onDateToChange(endOfYear(lastYear));
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filtros do Relatório
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Período */}
        <div className="space-y-4">
          <h3 className="font-medium">Período</h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickPeriod('thisMonth')}
            >
              Este Mês
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickPeriod('lastMonth')}
            >
              Mês Passado
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickPeriod('thisYear')}
            >
              Este Ano
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setQuickPeriod('lastYear')}
            >
              Ano Passado
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? (
                      format(dateFrom, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && onDateFromChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? (
                      format(dateTo, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && onDateToChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Tipo de Relatório */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tipo de Relatório</label>
          <Select value={reportType} onValueChange={onReportTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consolidado">Relatório Consolidado</SelectItem>
              <SelectItem value="pagamentos">Apenas Pagamentos</SelectItem>
              <SelectItem value="parcelamentos">Apenas Parcelamentos</SelectItem>
              <SelectItem value="despesas">Apenas Despesas</SelectItem>
              <SelectItem value="fechamentos">Fechamentos de Caixa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
