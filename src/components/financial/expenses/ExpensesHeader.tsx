
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Receipt } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface ExpensesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewExpense: () => void;
  totalExpenses: number;
}

const ExpensesHeader = ({ searchTerm, onSearchChange, onNewExpense, totalExpenses }: ExpensesHeaderProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold">Despesas</h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Controle todos os gastos do seu negócio
          </p>
        </div>

        <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800/30 shrink-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200">Total de Despesas</p>
                <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 truncate">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
          />
        </div>

        <Button
          onClick={onNewExpense}
          className="gap-2 w-full sm:w-auto h-11 sm:h-10 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </Button>
      </div>
    </div>
  );
};

export default ExpensesHeader;
