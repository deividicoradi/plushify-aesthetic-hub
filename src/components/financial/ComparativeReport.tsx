import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateComparativeReport, ExportData } from '@/utils/exportUtils';
import { ExportButtons } from './ExportButtons';

interface ComparativeData {
  period: {
    atual: { from: string; to: string };
    anterior: { from: string; to: string };
  };
  receitas: {
    atual: number;
    anterior: number;
    crescimento: number;
    diferenca: number;
  };
  despesas: {
    atual: number;
    anterior: number;
    crescimento: number;
    diferenca: number;
  };
  saldoLiquido: {
    atual: number;
    anterior: number;
    crescimento: number;
    diferenca: number;
  };
}

interface ExportData {
  payments: any[];
  expenses: any[];
  installments: any[];
  cashClosures: any[];
  period: { from: string; to: string };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const ComparativeReport = () => {
  const { user } = useAuth();
  const [period1, setPeriod1] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [period2, setPeriod2] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(subMonths(new Date(), 1))
  });
  const [comparisonType, setComparisonType] = useState<string>('month');

  const fetchPeriodData = async (from: Date, to: Date) => {
    const fromDate = from.toISOString();
    const toDate = to.toISOString();

    // Buscar pagamentos
    const { data: payments } = await supabase
      .from('payments')
      .select(`
        *,
        payment_methods(name, type),
        clients(name)
      `)
      .eq('user_id', user?.id)
      .gte('created_at', fromDate)
      .lte('created_at', toDate);

    // Buscar parcelamentos
    const { data: installments } = await supabase
      .from('installments')
      .select(`
        *,
        payments(description, payment_methods(name))
      `)
      .eq('user_id', user?.id)
      .gte('due_date', fromDate)
      .lte('due_date', toDate);

    // Buscar despesas
    const { data: expenses } = await supabase
      .from('expenses')
      .select(`
        *,
        payment_methods(name, type)
      `)
      .eq('user_id', user?.id)
      .gte('expense_date', fromDate)
      .lte('expense_date', toDate);

    // Buscar fechamentos de caixa
    const { data: cashClosures } = await supabase
      .from('cash_closures')
      .select('*')
      .eq('user_id', user?.id)
      .gte('closure_date', fromDate)
      .lte('closure_date', toDate);

    return {
      payments: payments || [],
      installments: installments || [],
      expenses: expenses || [],
      cashClosures: cashClosures || [],
      period: { from: fromDate, to: toDate }
    };
  };

  const { data: data1, isLoading: loading1 } = useQuery({
    queryKey: ['comparative-data-1', user?.id, period1.from, period1.to],
    queryFn: () => fetchPeriodData(period1.from, period1.to),
    enabled: !!user?.id,
  });

  const { data: data2, isLoading: loading2 } = useQuery({
    queryKey: ['comparative-data-2', user?.id, period2.from, period2.to],
    queryFn: () => fetchPeriodData(period2.from, period2.to),
    enabled: !!user?.id,
  });

  const comparison = data1 && data2 ? generateComparativeReport(data1, data2) : null;

  const handlePeriodChange = (type: string, date: Date, period: number) => {
    if (type === 'from') {
      if (period === 1) {
        setPeriod1({ ...period1, from: date });
      } else {
        setPeriod2({ ...period2, from: date });
      }
    } else {
      if (period === 1) {
        setPeriod1({ ...period1, to: date });
      } else {
        setPeriod2({ ...period2, to: date });
      }
    }
  };

  const setQuickPeriod = (periodType: string) => {
    const today = new Date();
    let newPeriod1 = { from: period1.from, to: period1.to };
    let newPeriod2 = { from: period2.from, to: period2.to };

    if (periodType === 'month') {
      newPeriod1 = { from: startOfMonth(today), to: endOfMonth(today) };
      newPeriod2 = { from: startOfMonth(subMonths(today, 1)), to: endOfMonth(subMonths(today, 1)) };
    } else if (periodType === 'year') {
      newPeriod1 = { from: startOfMonth(today), to: endOfMonth(today) };
      newPeriod2 = { from: startOfMonth(subYears(today, 1)), to: endOfMonth(subYears(today, 1)) };
    }

    setPeriod1(newPeriod1);
    setPeriod2(newPeriod2);
  };

  const handleExportComparative = () => {
    if (!data1 || !data2) return;

    const comparativeData: ExportData = {
      payments: [...data1.payments, ...data2.payments],
      expenses: [...data1.expenses, ...data2.expenses],
      installments: [...data1.installments, ...data2.installments],
      cashClosures: [...(data1.cashClosures || []), ...(data2.cashClosures || [])],
      period: {
        from: period2.from.toISOString(),
        to: period1.to.toISOString()
      }
    };

    return comparativeData;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Análise Comparativa</h3>
        <p className="text-muted-foreground">
          Compare o desempenho financeiro entre dois períodos.
        </p>
      </div>

      {/* Filtros de Período */}
      <Card>
        <CardHeader>
          <CardTitle>Períodos de Comparação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => setQuickPeriod('month')}>
              Comparar Últimos Meses
            </Button>
            <Button variant="outline" size="sm" onClick={() => setQuickPeriod('year')}>
              Comparar Últimos Anos
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Período 1 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Período Atual</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">De</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period1.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {period1.from ? (
                          format(period1.from, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period1.from}
                        onSelect={(date) => date && handlePeriodChange('from', date, 1)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Até</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period1.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {period1.to ? (
                          format(period1.to, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period1.to}
                        onSelect={(date) => date && handlePeriodChange('to', date, 1)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Período 2 */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Período Anterior</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">De</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period2.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {period2.from ? (
                          format(period2.from, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period2.from}
                        onSelect={(date) => date && handlePeriodChange('from', date, 2)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Até</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !period2.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {period2.to ? (
                          format(period2.to, "dd/MM/yyyy", { locale: ptBR })
                        ) : (
                          <span>Selecione</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={period2.to}
                        onSelect={(date) => date && handlePeriodChange('to', date, 2)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Comparativo */}
      {comparison && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo Comparativo</CardTitle>
            <p className="text-sm text-muted-foreground">
              Comparando {format(new Date(comparison.period.anterior.from), "MMMM yyyy", { locale: ptBR })} e {format(new Date(comparison.period.atual.from), "MMMM yyyy", { locale: ptBR })}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Receitas */}
              <div className="space-y-2">
                <div className="text-lg font-semibold">Receitas</div>
                <div className="flex items-center gap-2">
                  {comparison.receitas.crescimento >= 0 ? (
                    <TrendingUp className="text-green-500 w-5 h-5" />
                  ) : (
                    <TrendingDown className="text-red-500 w-5 h-5" />
                  )}
                  <span>{comparison.receitas.crescimento.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(comparison.receitas.atual)} ({formatCurrency(comparison.receitas.anterior)} no período anterior)
                </div>
              </div>

              {/* Despesas */}
              <div className="space-y-2">
                <div className="text-lg font-semibold">Despesas</div>
                <div className="flex items-center gap-2">
                  {comparison.despesas.crescimento >= 0 ? (
                    <TrendingUp className="text-red-500 w-5 h-5" />
                  ) : (
                    <TrendingDown className="text-green-500 w-5 h-5" />
                  )}
                  <span>{comparison.despesas.crescimento.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(comparison.despesas.atual)} ({formatCurrency(comparison.despesas.anterior)} no período anterior)
                </div>
              </div>

              {/* Saldo Líquido */}
              <div className="space-y-2">
                <div className="text-lg font-semibold">Saldo Líquido</div>
                <div className="flex items-center gap-2">
                  {comparison.saldoLiquido.crescimento >= 0 ? (
                    <TrendingUp className="text-green-500 w-5 h-5" />
                  ) : (
                    <TrendingDown className="text-red-500 w-5 h-5" />
                  )}
                  <span>{comparison.saldoLiquido.crescimento.toFixed(1)}%</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(comparison.saldoLiquido.atual)} ({formatCurrency(comparison.saldoLiquido.anterior)} no período anterior)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data1 && data2 && (
        <ExportButtons
          reportData={handleExportComparative() || {
            payments: [],
            expenses: [],
            installments: [],
            cashClosures: [],
            period: { from: new Date().toISOString(), to: new Date().toISOString() }
          }}
          isLoading={loading1 || loading2}
        />
      )}
    </div>
  );
};

export default ComparativeReport;
