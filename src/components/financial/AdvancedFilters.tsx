
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CalendarIcon, Filter, X, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export interface FilterOptions {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  categories: string[];
  paymentMethods: string[];
  status: string[];
  amountRange: {
    min: number | null;
    max: number | null;
  };
  searchTerm: string;
  includePayments: boolean;
  includeExpenses: boolean;
  includeInstallments: boolean;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableCategories: string[];
  availablePaymentMethods: string[];
  onClearFilters: () => void;
}

export const AdvancedFilters = ({
  filters,
  onFiltersChange,
  availableCategories,
  availablePaymentMethods,
  onClearFilters
}: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleCategory = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilter('categories', categories);
  };

  const togglePaymentMethod = (method: string) => {
    const methods = filters.paymentMethods.includes(method)
      ? filters.paymentMethods.filter(m => m !== method)
      : [...filters.paymentMethods, method];
    updateFilter('paymentMethods', methods);
  };

  const toggleStatus = (status: string) => {
    const statuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilter('status', statuses);
  };

  const activeFiltersCount = [
    filters.dateRange.from || filters.dateRange.to,
    filters.categories.length > 0,
    filters.paymentMethods.length > 0,
    filters.status.length > 0,
    filters.amountRange.min || filters.amountRange.max,
    filters.searchTerm,
    !filters.includePayments || !filters.includeExpenses || !filters.includeInstallments
  ].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={onClearFilters}>
                <X className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-6">
          {/* Busca por texto */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por descrição, cliente, etc..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Período */}
          <div className="space-y-4">
            <label className="text-sm font-medium">Período</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Data Inicial</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        format(filters.dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from || undefined}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Data Final</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? (
                        format(filters.dateRange.to, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Selecione</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to || undefined}
                      onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, to: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Tipos de transação */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tipos de Transação</label>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-payments"
                  checked={filters.includePayments}
                  onCheckedChange={(checked) => updateFilter('includePayments', checked)}
                />
                <label htmlFor="include-payments" className="text-sm">Pagamentos</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-expenses"
                  checked={filters.includeExpenses}
                  onCheckedChange={(checked) => updateFilter('includeExpenses', checked)}
                />
                <label htmlFor="include-expenses" className="text-sm">Despesas</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-installments"
                  checked={filters.includeInstallments}
                  onCheckedChange={(checked) => updateFilter('includeInstallments', checked)}
                />
                <label htmlFor="include-installments" className="text-sm">Parcelamentos</label>
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Categorias</label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <Button
                  key={category}
                  variant={filters.categories.includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category)}
                >
                  {category}
                  {filters.categories.includes(category) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Métodos de Pagamento</label>
            <div className="flex flex-wrap gap-2">
              {availablePaymentMethods.map((method) => (
                <Button
                  key={method}
                  variant={filters.paymentMethods.includes(method) ? "default" : "outline"}
                  size="sm"
                  onClick={() => togglePaymentMethod(method)}
                >
                  {method}
                  {filters.paymentMethods.includes(method) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Status</label>
            <div className="flex flex-wrap gap-2">
              {['pago', 'pendente', 'vencido', 'cancelado'].map((status) => (
                <Button
                  key={status}
                  variant={filters.status.includes(status) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                  {filters.status.includes(status) && (
                    <X className="w-3 h-3 ml-1" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Faixa de valores */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Faixa de Valores</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Valor Mínimo</label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={filters.amountRange.min || ''}
                  onChange={(e) => updateFilter('amountRange', {
                    ...filters.amountRange,
                    min: e.target.value ? Number(e.target.value) : null
                  })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Valor Máximo</label>
                <Input
                  type="number"
                  placeholder="999999,99"
                  value={filters.amountRange.max || ''}
                  onChange={(e) => updateFilter('amountRange', {
                    ...filters.amountRange,
                    max: e.target.value ? Number(e.target.value) : null
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
