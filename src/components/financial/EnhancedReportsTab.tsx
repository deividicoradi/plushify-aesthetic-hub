import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, FileBarChart, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ExportButtons } from './ExportButtons';
import { AdvancedFilters, FilterOptions } from './AdvancedFilters';
import ComparativeReport from './ComparativeReport';
import ReportsTab from './ReportsTab';

const EnhancedReportsTab = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    },
    categories: [],
    paymentMethods: [],
    status: [],
    amountRange: { min: null, max: null },
    searchTerm: '',
    includePayments: true,
    includeExpenses: true,
    includeInstallments: true
  });

  // Buscar dados com filtros aplicados
  const { data: filteredData, isLoading } = useQuery({
    queryKey: ['filtered-financial-data', user?.id, filters],
    queryFn: async () => {
      const fromDate = filters.dateRange.from?.toISOString();
      const toDate = filters.dateRange.to?.toISOString();

      // Construir query para pagamentos
      let paymentsQuery = supabase
        .from('payments')
        .select(`
          *,
          payment_methods(name, type),
          clients(name)
        `)
        .eq('user_id', user?.id);

      if (fromDate) paymentsQuery = paymentsQuery.gte('created_at', fromDate);
      if (toDate) paymentsQuery = paymentsQuery.lte('created_at', toDate);

      // Construir query para despesas
      let expensesQuery = supabase
        .from('expenses')
        .select(`
          *,
          payment_methods(name, type)
        `)
        .eq('user_id', user?.id);

      if (fromDate) expensesQuery = expensesQuery.gte('expense_date', fromDate);
      if (toDate) expensesQuery = expensesQuery.lte('expense_date', toDate);

      // Construir query para parcelamentos
      let installmentsQuery = supabase
        .from('installments')
        .select(`
          *,
          payments(
            description,
            payment_methods(name, type)
          )
        `)
        .eq('user_id', user?.id);

      if (fromDate) installmentsQuery = installmentsQuery.gte('due_date', fromDate);
      if (toDate) installmentsQuery = installmentsQuery.lte('due_date', toDate);

      // Executar queries
      const [paymentsResult, expensesResult, installmentsResult] = await Promise.all([
        paymentsQuery,
        expensesQuery,
        installmentsQuery
      ]);

      // Processar resultados e aplicar filtros
      let payments = paymentsResult.data || [];
      let expenses = expensesResult.data || [];
      let installments = installmentsResult.data || [];

      // Aplicar filtros de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        payments = payments.filter(p => 
          p.description?.toLowerCase().includes(searchLower) ||
          (p.clients as any)?.name?.toLowerCase().includes(searchLower)
        );
        expenses = expenses.filter(e => 
          e.description?.toLowerCase().includes(searchLower) ||
          e.category?.toLowerCase().includes(searchLower)
        );
      }

      // Aplicar filtros de status
      if (filters.status.length > 0) {
        payments = payments.filter(p => filters.status.includes(p.status));
        installments = installments.filter(i => filters.status.includes(i.status));
      }

      // Aplicar filtros de métodos de pagamento
      if (filters.paymentMethods.length > 0) {
        payments = payments.filter(p => {
          const methodName = (p.payment_methods as any)?.name;
          return methodName && filters.paymentMethods.includes(methodName);
        });
        expenses = expenses.filter(e => {
          const methodName = (e.payment_methods as any)?.name;
          return methodName && filters.paymentMethods.includes(methodName);
        });
      }

      // Aplicar filtros de categorias (apenas para despesas)
      if (filters.categories.length > 0) {
        expenses = expenses.filter(e => e.category && filters.categories.includes(e.category));
      }

      // Aplicar filtros de valor
      if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
        if (filters.amountRange.min !== null) {
          payments = payments.filter(p => Number(p.amount) >= filters.amountRange.min!);
          expenses = expenses.filter(e => Number(e.amount) >= filters.amountRange.min!);
          installments = installments.filter(i => Number(i.amount) >= filters.amountRange.min!);
        }
        if (filters.amountRange.max !== null) {
          payments = payments.filter(p => Number(p.amount) <= filters.amountRange.max!);
          expenses = expenses.filter(e => Number(e.amount) <= filters.amountRange.max!);
          installments = installments.filter(i => Number(i.amount) <= filters.amountRange.max!);
        }
      }

      // Aplicar filtros de tipo de transação
      if (!filters.includePayments) payments = [];
      if (!filters.includeExpenses) expenses = [];
      if (!filters.includeInstallments) installments = [];

      return {
        payments,
        expenses,
        installments,
        cashClosures: [],
        period: {
          from: fromDate || new Date().toISOString(),
          to: toDate || new Date().toISOString()
        }
      };
    },
    enabled: !!user?.id,
  });

  // Buscar categorias disponíveis
  const { data: availableCategories } = useQuery({
    queryKey: ['available-categories', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('expenses')
        .select('category')
        .eq('user_id', user?.id);

      const categories = [...new Set(data?.map(item => item.category))];
      return categories;
    },
    enabled: !!user?.id,
  });

  // Buscar métodos de pagamento disponíveis
  const { data: availablePaymentMethods } = useQuery({
    queryKey: ['available-payment-methods', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('payment_methods')
        .select('name')
        .eq('user_id', user?.id);

      const paymentMethods = data?.map(item => item.name) || [];
      return paymentMethods;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatórios Avançados</h2>
        <p className="text-muted-foreground">
          Filtros personalizados, exportações e análises comparativas
        </p>
      </div>

      <Tabs defaultValue="filtered" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="filtered">Relatórios Filtrados</TabsTrigger>
          <TabsTrigger value="comparative">Análise Comparativa</TabsTrigger>
          <TabsTrigger value="standard">Relatórios Padrão</TabsTrigger>
        </TabsList>

        <TabsContent value="filtered" className="space-y-6">
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableCategories={availableCategories || []}
            availablePaymentMethods={availablePaymentMethods || []}
            onClearFilters={() => setFilters({
              dateRange: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
              categories: [],
              paymentMethods: [],
              status: [],
              amountRange: { min: null, max: null },
              searchTerm: '',
              includePayments: true,
              includeExpenses: true,
              includeInstallments: true
            })}
          />

          {filteredData && (
            <ExportButtons
              reportData={filteredData}
              isLoading={isLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="comparative">
          <ComparativeReport />
        </TabsContent>

        <TabsContent value="standard">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedReportsTab;
