
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
    <>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">Despesas</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Controle todos os gastos do seu negócio
          </p>
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

      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar despesas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 sm:h-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
          />
        </div>
        
        <div className="flex gap-2 w-full justify-end">
          <Button onClick={onNewExpense} className="gap-2 touch-target">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Despesa</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ExpensesHeader;
