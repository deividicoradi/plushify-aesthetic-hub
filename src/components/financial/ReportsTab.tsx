
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FileText, Download, Filter } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";
import { generateFinancialReport } from '@/utils/pdfReports';

const ReportsTab = () => {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [reportType, setReportType] = useState<string>('consolidado');
  const [isGenerating, setIsGenerating] = useState(false);

  // Buscar dados consolidados para o relatório
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['financial-report', user?.id, dateFrom, dateTo, reportType],
    queryFn: async () => {
      const fromDate = dateFrom.toISOString();
      const toDate = dateTo.toISOString();

      console.log('🔍 Buscando dados do relatório para o período:', { fromDate, toDate });

      // Buscar pagamentos realizados (status = 'pago') usando payment_date para filtro temporal
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          payment_methods(name, type),
          clients(name)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'pago')
        .gte('payment_date', fromDate)
        .lte('payment_date', toDate)
        .not('payment_date', 'is', null);

      console.log('💰 Pagamentos encontrados:', payments);
      if (paymentsError) {
        console.error('❌ Erro ao buscar pagamentos:', paymentsError);
      }

      // Buscar parcelamentos do período
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
      const { data: cashClosures, error: cashClosuresError } = await supabase
        .from('cash_closures')
        .select('*')
        .eq('user_id', user?.id)
        .gte('closure_date', fromDate)
        .lte('closure_date', toDate);

      console.log('🏦 Fechamentos de caixa encontrados:', cashClosures);
      if (cashClosuresError) {
        console.error('❌ Erro ao buscar fechamentos:', cashClosuresError);
      }

      return {
        payments: payments || [],
        installments: installments || [],
        expenses: expenses || [],
        cashClosures: cashClosures || [],
        period: { from: fromDate, to: toDate }
      };
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleGenerateReport = async () => {
    if (!reportData) return;

    setIsGenerating(true);
    try {
      await generateFinancialReport(reportData, reportType);
      toast({
        title: "Sucesso!",
        description: "Relatório PDF gerado com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar relatório",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const setQuickPeriod = (period: string) => {
    const today = new Date();
    switch (period) {
      case 'thisMonth':
        setDateFrom(startOfMonth(today));
        setDateTo(endOfMonth(today));
        break;
      case 'lastMonth':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        setDateFrom(startOfMonth(lastMonth));
        setDateTo(endOfMonth(lastMonth));
        break;
      case 'thisYear':
        setDateFrom(startOfYear(today));
        setDateTo(endOfYear(today));
        break;
      case 'lastYear':
        const lastYear = new Date(today.getFullYear() - 1, 0, 1);
        setDateFrom(startOfYear(lastYear));
        setDateTo(endOfYear(lastYear));
        break;
    }
  };

  // Calcular totais usando paid_amount dos pagamentos realizados + fechamentos de caixa
  const totalReceitasFromPayments = reportData?.payments.reduce((sum, p) => {
    const amount = Number(p.paid_amount) || 0;
    console.log('💵 Adicionando ao total de receitas (pagamento):', amount);
    return sum + amount;
  }, 0) || 0;

  const totalReceitasFromCashClosures = reportData?.cashClosures.reduce((sum, c) => {
    const amount = Number(c.total_income) || 0;
    console.log('🏦 Adicionando ao total de receitas (fechamento):', amount);
    return sum + amount;
  }, 0) || 0;

  const totalReceitas = totalReceitasFromPayments + totalReceitasFromCashClosures;
  
  const totalDespesas = reportData?.expenses.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
  
  const parcelasVencidas = reportData?.installments.filter(i => 
    new Date(i.due_date) < new Date() && i.status === 'pendente'
  ).length || 0;

  console.log('📊 Totais calculados:', { totalReceitas, totalDespesas, parcelasVencidas });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios Financeiros</h2>
        <p className="text-muted-foreground">
          Gere relatórios detalhados em PDF com filtros personalizados
        </p>
      </div>

      {/* Filtros */}
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
                      onSelect={(date) => date && setDateFrom(date)}
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
                      onSelect={(date) => date && setDateTo(date)}
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
            <Select value={reportType} onValueChange={setReportType}>
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

      {/* Resumo dos Dados */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalReceitas)}
                </div>
                <div className="text-sm text-muted-foreground">Total Receitas</div>
              </div>

              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalDespesas)}
                </div>
                <div className="text-sm text-muted-foreground">Total Despesas</div>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalReceitas - totalDespesas)}
                </div>
                <div className="text-sm text-muted-foreground">Saldo Líquido</div>
              </div>

              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {parcelasVencidas}
                </div>
                <div className="text-sm text-muted-foreground">Parcelas Vencidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botão de Gerar Relatório */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerateReport}
              disabled={isGenerating || isLoading || !reportData}
              className="flex items-center gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Download className="w-4 h-4 animate-spin" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Gerar Relatório PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Dados (Preview) */}
      {reportData && (
        <div className="grid gap-4">
          {reportType === 'consolidado' || reportType === 'pagamentos' ? (
            <Card>
              <CardHeader>
                <CardTitle>Pagamentos ({reportData.payments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reportData.payments.slice(0, 5).map((payment: any) => (
                    <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{payment.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.clients?.name || 'Cliente não informado'}
                        </div>
                      </div>
                      <Badge variant="default">
                        {formatCurrency(Number(payment.paid_amount))}
                      </Badge>
                    </div>
                  ))}
                  {reportData.payments.length > 5 && (
                    <div className="text-sm text-muted-foreground text-center">
                      +{reportData.payments.length - 5} mais...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {reportType === 'consolidado' || reportType === 'fechamentos' ? (
            <Card>
              <CardHeader>
                <CardTitle>Fechamentos de Caixa ({reportData.cashClosures.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reportData.cashClosures.slice(0, 5).map((closure: any) => (
                    <div key={closure.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">Fechamento de Caixa</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(closure.closure_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                      </div>
                      <Badge variant="default">
                        {formatCurrency(Number(closure.total_income))}
                      </Badge>
                    </div>
                  ))}
                  {reportData.cashClosures.length > 5 && (
                    <div className="text-sm text-muted-foreground text-center">
                      +{reportData.cashClosures.length - 5} mais...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {reportType === 'consolidado' || reportType === 'despesas' ? (
            <Card>
              <CardHeader>
                <CardTitle>Despesas ({reportData.expenses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {reportData.expenses.slice(0, 5).map((expense: any) => (
                    <div key={expense.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <div className="font-medium">{expense.description}</div>
                        <div className="text-sm text-muted-foreground">{expense.category}</div>
                      </div>
                      <Badge variant="destructive">
                        {formatCurrency(Number(expense.amount))}
                      </Badge>
                    </div>
                  ))}
                  {reportData.expenses.length > 5 && (
                    <div className="text-sm text-muted-foreground text-center">
                      +{reportData.expenses.length - 5} mais...
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ReportsTab;
