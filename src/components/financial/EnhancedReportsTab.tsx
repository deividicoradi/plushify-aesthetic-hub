
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Filter, Download, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AdvancedFilters, FilterOptions } from './AdvancedFilters';
import { ExportButtons } from './ExportButtons';
import { ComparativeReport } from './ComparativeReport';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const EnhancedReportsTab = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { from: null, to: null },
    categories: [],
    paymentMethods: [],
    status: [],
    amountRange: { min: null, max: null },
    searchTerm: '',
    includePayments: true,
    includeExpenses: true,
    includeInstallments: true
  });

  // Buscar todos os dados para filtros
  const { data: allData, isLoading } = useQuery({
    queryKey: ['enhanced-reports-data', user?.id],
    queryFn: async () => {
      const [paymentsResult, expensesResult, installmentsResult, methodsResult] = await Promise.all([
        supabase
          .from('payments')
          .select(`
            *,
            payment_methods(name, type),
            clients(name)
          `)
          .eq('user_id', user?.id),
        supabase
          .from('expenses')
          .select(`
            *,
            payment_methods(name, type)
          `)
          .eq('user_id', user?.id),
        supabase
          .from('installments')
          .select(`
            *,
            payments(description, payment_methods(name))
          `)
          .eq('user_id', user?.id),
        supabase
          .from('payment_methods')
          .select('name')
          .eq('user_id', user?.id)
          .eq('active', true)
      ]);

      return {
        payments: paymentsResult.data || [],
        expenses: expensesResult.data || [],
        installments: installmentsResult.data || [],
        paymentMethods: methodsResult.data || []
      };
    },
    enabled: !!user?.id,
  });

  // Aplicar filtros
  const filteredData = useMemo(() => {
    if (!allData) return { payments: [], expenses: [], installments: [] };

    let { payments, expenses, installments } = allData;

    // Filtro por data
    if (filters.dateRange.from || filters.dateRange.to) {
      if (filters.includePayments) {
        payments = payments.filter(p => {
          const date = new Date(p.created_at);
          const afterFrom = !filters.dateRange.from || date >= filters.dateRange.from;
          const beforeTo = !filters.dateRange.to || date <= filters.dateRange.to;
          return afterFrom && beforeTo;
        });
      }
      
      if (filters.includeExpenses) {
        expenses = expenses.filter(e => {
          const date = new Date(e.expense_date);
          const afterFrom = !filters.dateRange.from || date >= filters.dateRange.from;
          const beforeTo = !filters.dateRange.to || date <= filters.dateRange.to;
          return afterFrom && beforeTo;
        });
      }
      
      if (filters.includeInstallments) {
        installments = installments.filter(i => {
          const date = new Date(i.due_date);
          const afterFrom = !filters.dateRange.from || date >= filters.dateRange.from;
          const beforeTo = !filters.dateRange.to || date <= filters.dateRange.to;
          return afterFrom && beforeTo;
        });
      }
    }

    // Filtro por busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      payments = payments.filter(p => 
        p.description?.toLowerCase().includes(searchLower) ||
        p.clients?.name?.toLowerCase().includes(searchLower)
      );
      expenses = expenses.filter(e => 
        e.description?.toLowerCase().includes(searchLower) ||
        e.category?.toLowerCase().includes(searchLower)
      );
      installments = installments.filter(i => 
        i.payments?.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categorias
    if (filters.categories.length > 0) {
      expenses = expenses.filter(e => filters.categories.includes(e.category));
    }

    // Filtro por métodos de pagamento
    if (filters.paymentMethods.length > 0) {
      payments = payments.filter(p => 
        p.payment_methods && filters.paymentMethods.includes(p.payment_methods.name)
      );
      expenses = expenses.filter(e => 
        e.payment_methods && filters.paymentMethods.includes(e.payment_methods.name)
      );
    }

    // Filtro por status
    if (filters.status.length > 0) {
      payments = payments.filter(p => filters.status.includes(p.status));
      installments = installments.filter(i => {
        let status = i.status;
        if (status === 'pendente' && new Date(i.due_date) < new Date()) {
          status = 'vencido';
        }
        return filters.status.includes(status);
      });
    }

    // Filtro por faixa de valores
    if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
      const min = filters.amountRange.min || 0;
      const max = filters.amountRange.max || Infinity;
      
      payments = payments.filter(p => {
        const amount = Number(p.amount);
        return amount >= min && amount <= max;
      });
      expenses = expenses.filter(e => {
        const amount = Number(e.amount);
        return amount >= min && amount <= max;
      });
      installments = installments.filter(i => {
        const amount = Number(i.amount);
        return amount >= min && amount <= max;
      });
    }

    // Aplicar filtros de inclusão de tipos
    return {
      payments: filters.includePayments ? payments : [],
      expenses: filters.includeExpenses ? expenses : [],
      installments: filters.includeInstallments ? installments : []
    };
  }, [allData, filters]);

  // Preparar dados para exportação
  const exportData = useMemo(() => {
    if (!filteredData) return null;

    const fromDate = filters.dateRange.from || (allData?.payments[0] ? new Date(allData.payments[0].created_at) : new Date());
    const toDate = filters.dateRange.to || new Date();

    return {
      ...filteredData,
      cashClosures: [], // Para compatibilidade
      period: {
        from: fromDate.toISOString(),
        to: toDate.toISOString()
      }
    };
  }, [filteredData, filters]);

  // Obter categorias e métodos disponíveis
  const availableCategories = useMemo(() => {
    if (!allData) return [];
    const categories = new Set<string>();
    allData.expenses.forEach(e => {
      if (e.category) categories.add(e.category);
    });
    return Array.from(categories);
  }, [allData]);

  const availablePaymentMethods = useMemo(() => {
    if (!allData) return [];
    return allData.paymentMethods.map(pm => pm.name);
  }, [allData]);

  const clearFilters = () => {
    setFilters({
      dateRange: { from: null, to: null },
      categories: [],
      paymentMethods: [],
      status: [],
      amountRange: { min: null, max: null },
      searchTerm: '',
      includePayments: true,
      includeExpenses: true,
      includeInstallments: true
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular métricas dos dados filtrados
  const metrics = useMemo(() => {
    const totalReceitas = filteredData.payments.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
    const totalDespesas = filteredData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const parcelasVencidas = filteredData.installments.filter(i => 
      new Date(i.due_date) < new Date() && i.status === 'pendente'
    ).length;

    return {
      totalReceitas,
      totalDespesas,
      saldoLiquido: totalReceitas - totalDespesas,
      totalRegistros: filteredData.payments.length + filteredData.expenses.length + filteredData.installments.length,
      parcelasVencidas
    };
  }, [filteredData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios Avançados</h2>
        <p className="text-muted-foreground">
          Filtros avançados, exportações e análises comparativas
        </p>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="export">
            <Download className="w-4 h-4 mr-2" />
            Exportações
          </TabsTrigger>
          <TabsTrigger value="comparative">
            <TrendingUp className="w-4 h-4 mr-2" />
            Comparativo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filtros Avançados */}
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableCategories={availableCategories}
            availablePaymentMethods={availablePaymentMethods}
            onClearFilters={clearFilters}
          />

          {/* Resumo dos Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resumo dos Resultados Filtrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {metrics.totalRegistros}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Registros</div>
                </div>

                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(metrics.totalReceitas)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Receitas</div>
                </div>

                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(metrics.totalDespesas)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Despesas</div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {formatCurrency(metrics.saldoLiquido)}
                  </div>
                  <div className="text-sm text-muted-foreground">Saldo Líquido</div>
                </div>

                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {metrics.parcelasVencidas}
                  </div>
                  <div className="text-sm text-muted-foreground">Parcelas Vencidas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Filtrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Pagamentos */}
                {filteredData.payments.map((payment: any) => (
                  <div key={`payment-${payment.id}`} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{payment.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {payment.clients?.name || 'Cliente não informado'} • 
                        {format(new Date(payment.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="mb-1">
                        {formatCurrency(Number(payment.paid_amount || 0))}
                      </Badge>
                      <div className="text-xs text-muted-foreground">Receita</div>
                    </div>
                  </div>
                ))}

                {/* Despesas */}
                {filteredData.expenses.map((expense: any) => (
                  <div key={`expense-${expense.id}`} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{expense.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {expense.category} • 
                        {format(new Date(expense.expense_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="mb-1">
                        {formatCurrency(Number(expense.amount))}
                      </Badge>
                      <div className="text-xs text-muted-foreground">Despesa</div>
                    </div>
                  </div>
                ))}

                {/* Parcelamentos */}
                {filteredData.installments.map((installment: any) => (
                  <div key={`installment-${installment.id}`} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        Parcela {installment.installment_number}/{installment.total_installments}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {installment.payments?.description || 'Parcelamento'} • 
                        {format(new Date(installment.due_date), 'dd/MM/yyyy', { locale: ptBR })}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={installment.status === 'pago' ? 'default' : 'secondary'} className="mb-1">
                        {formatCurrency(Number(installment.amount))}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {installment.status === 'pendente' && new Date(installment.due_date) < new Date() 
                          ? 'Vencido' : installment.status}
                      </div>
                    </div>
                  </div>
                ))}

                {metrics.totalRegistros === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado com os filtros aplicados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <ExportButtons 
            reportData={exportData || { payments: [], expenses: [], installments: [], cashClosures: [], period: { from: '', to: '' } }}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="comparative" className="space-y-6">
          <ComparativeReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReportsTab;
