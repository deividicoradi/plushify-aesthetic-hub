
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Receipt } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ExpenseDialog from './ExpenseDialog';

const ExpensesTab = () => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          payment_methods (name, type)
        `)
        .eq('user_id', user?.id)
        .order('expense_date', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig: Record<string, { label: string; variant: any }> = {
      'material': { label: 'Material', variant: 'default' },
      'equipamento': { label: 'Equipamento', variant: 'secondary' },
      'marketing': { label: 'Marketing', variant: 'outline' },
      'aluguel': { label: 'Aluguel', variant: 'destructive' },
      'outros': { label: 'Outros', variant: 'secondary' },
    };
    
    const config = categoryConfig[category] || categoryConfig.outros;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredExpenses = expenses?.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = filteredExpenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Despesas</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Controle todos os gastos do seu negócio
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">Total de Despesas</p>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">Carregando despesas...</div>
        ) : filteredExpenses?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhuma despesa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses?.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{expense.description}</h3>
                      {getCategoryBadge(expense.category)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {expense.payment_methods && (
                        <p>Método: {expense.payment_methods.name}</p>
                      )}
                      <p>Data: {format(new Date(expense.expense_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                      {expense.notes && (
                        <p className="text-xs text-gray-500">Obs: {expense.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(Number(expense.amount))}
                    </p>
                    {expense.receipt_url && (
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Comprovante anexado
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ExpenseDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default ExpensesTab;
