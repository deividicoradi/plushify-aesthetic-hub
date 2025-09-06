
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Calculator, TrendingUp, TrendingDown, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MetricCard from './MetricCard';

interface CashClosureCardProps {
  closure: any;
  onEdit?: (closure: any) => void;
  onDelete?: (id: string) => void;
}

const CashClosureCard = ({ closure, onEdit, onDelete }: CashClosureCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberto: { label: 'Aberto', variant: 'secondary' as const },
      fechado: { label: 'Fechado', variant: 'default' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberto;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="w-full overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-lg shrink-0">
              <Calculator className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Fechamento de Caixa
              </CardTitle>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                {format(new Date(closure.closure_date), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start">
            {getStatusBadge(closure.status)}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(closure)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(closure.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="mt-4 space-y-2">
          {closure.closed_at && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="shrink-0">Fechado em:</span>
              <span className="font-medium">
                {format(new Date(closure.closed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {closure.operator_id && (
              <div className="flex items-center gap-2">
                <span>Operador:</span>
                <span className="font-medium">{closure.operator_id.slice(0, 8)}...</span>
              </div>
            )}
            {closure.machine_id && (
              <div className="flex items-center gap-2">
                <span>Terminal:</span>
                <span className="font-medium">{closure.machine_id.slice(-8)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Main Metrics - 4 card grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full">
                <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-300">Saldo Inicial</p>
              <p className="font-bold text-sm text-blue-900 dark:text-blue-100">
                {formatCurrency(Number(closure.opening_balance))}
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-green-700 dark:text-green-300">Total Receitas</p>
              <p className="font-bold text-sm text-green-900 dark:text-green-100">
                {formatCurrency(Number(closure.total_income))}
              </p>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center space-y-2">
            <div className="flex justify-center">
              <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-full">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div>
              <p className="text-xs text-red-700 dark:text-red-300">Total Despesas</p>
              <p className="font-bold text-sm text-red-900 dark:text-red-100">
                {formatCurrency(Number(closure.total_expenses))}
              </p>
            </div>
          </div>
          
          <div className={`p-4 rounded-lg border text-center space-y-2 ${
            Number(closure.closing_balance) >= Number(closure.opening_balance)
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
          }`}>
            <div className="flex justify-center">
              <div className={`p-2 rounded-full ${
                Number(closure.closing_balance) >= Number(closure.opening_balance)
                  ? 'bg-emerald-100 dark:bg-emerald-800/50'
                  : 'bg-orange-100 dark:bg-orange-800/50'
              }`}>
                <Calculator className={`w-4 h-4 ${
                  Number(closure.closing_balance) >= Number(closure.opening_balance)
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
            </div>
            <div>
              <p className={`text-xs ${
                Number(closure.closing_balance) >= Number(closure.opening_balance)
                  ? 'text-emerald-700 dark:text-emerald-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}>
                Saldo Final
              </p>
              <p className={`font-bold text-sm ${
                Number(closure.closing_balance) >= Number(closure.opening_balance)
                  ? 'text-emerald-900 dark:text-emerald-100'
                  : 'text-orange-900 dark:text-orange-100'
              }`}>
                {formatCurrency(Number(closure.closing_balance))}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
            Detalhamento por Método de Pagamento
          </h4>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dinheiro</p>
                  <p className="text-base font-bold text-foreground">
                    {formatCurrency(Number(closure.cash_amount))}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cartão</p>
                  <p className="text-base font-bold text-foreground">
                    {formatCurrency(Number(closure.card_amount))}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Calculator className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">PIX</p>
                  <p className="text-base font-bold text-foreground">
                    {formatCurrency(Number(closure.pix_amount))}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                  <Calculator className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Outros</p>
                  <p className="text-base font-bold text-foreground">
                    {formatCurrency(Number(closure.other_amount))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Difference Section - Only show if there's a difference */}
        {Number(closure.difference) !== 0 && (
          <div className={`p-4 rounded-lg border ${
            Number(closure.difference) > 0 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full shrink-0 ${
                Number(closure.difference) > 0 
                  ? 'bg-green-100 dark:bg-green-800/50' 
                  : 'bg-red-100 dark:bg-red-800/50'
              }`}>
                {Number(closure.difference) > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${
                  Number(closure.difference) > 0 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  Diferença: {formatCurrency(Number(closure.difference))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {Number(closure.difference) > 0 ? 'Superávit no caixa' : 'Déficit no caixa'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {closure.notes && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-full shrink-0">
                <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Observações:</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 break-words">{closure.notes}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashClosureCard;
