
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Lock,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  MoreVertical,
  Edit,
  Trash2,
  StickyNote,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashClosureCardProps {
  closure: any;
  onEdit?: (closure: any) => void;
  onDelete?: (id: string) => void;
}

const CashClosureCard = ({ closure, onEdit, onDelete }: CashClosureCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const difference = Number(closure.difference) || 0;
  const hasDifference = Math.abs(difference) > 0.01;

  return (
    <Card className="w-full overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300">
      {/* Compact Header */}
      <CardHeader className="bg-gradient-to-br from-destructive/5 via-destructive/10 to-destructive/5 border-b border-border/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-destructive/10 rounded-lg border border-destructive/20">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold text-foreground mb-0.5">
                Fechamento de Caixa
              </CardTitle>
              <p className="text-sm font-semibold text-destructive">
                {format(new Date(closure.closure_date), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              {closure.closed_at && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(closure.closed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={closure.status === 'fechado' ? 'default' : 'secondary'}
              className={`px-2 py-1 text-xs font-medium ${
                closure.status === 'fechado' 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-500 text-white'
              }`}
            >
              {closure.status === 'fechado' ? 'Fechado' : 'Aberto'}
            </Badge>
            
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(closure)} className="gap-2 text-xs">
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(closure.id)}
                      className="gap-2 text-xs text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Deletar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {/* Main Financial Metrics Grid - More Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Initial Balance */}
          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-1.5 bg-blue-500/10 dark:bg-blue-400/10 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 uppercase tracking-wide">
              Saldo Inicial
            </p>
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100 leading-tight">
              {formatCurrency(Number(closure.opening_balance))}
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-emerald-50/80 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1 uppercase tracking-wide">
              Total Receitas
            </p>
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
              {formatCurrency(Number(closure.total_income))}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-50/80 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border border-red-200/60 dark:border-red-800/40 rounded-lg p-3 text-center">
            <div className="flex justify-center mb-2">
              <div className="p-1.5 bg-red-500/10 dark:bg-red-400/10 rounded-full border border-red-200/50 dark:border-red-700/50">
                <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-xs font-semibold text-red-700 dark:text-red-300 mb-1 uppercase tracking-wide">
              Total Despesas
            </p>
            <p className="text-sm font-bold text-red-900 dark:text-red-100 leading-tight">
              {formatCurrency(Number(closure.total_expenses))}
            </p>
          </div>

          {/* Final Balance */}
          <div className={`rounded-lg p-3 text-center border ${
            Number(closure.closing_balance) >= Number(closure.opening_balance)
              ? 'bg-gradient-to-br from-green-50/80 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/60 dark:border-green-800/40'
              : 'bg-gradient-to-br from-orange-50/80 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border-orange-200/60 dark:border-orange-800/40'
          }`}>
            <div className="flex justify-center mb-2">
              <div className={`p-1.5 rounded-full border ${
                Number(closure.closing_balance) >= Number(closure.opening_balance)
                  ? 'bg-green-500/10 dark:bg-green-400/10 border-green-200/50 dark:border-green-700/50'
                  : 'bg-orange-500/10 dark:bg-orange-400/10 border-orange-200/50 dark:border-orange-700/50'
              }`}>
                <Calculator className={`w-4 h-4 ${
                  Number(closure.closing_balance) >= Number(closure.opening_balance)
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-orange-600 dark:text-orange-400'
                }`} />
              </div>
            </div>
            <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${
              Number(closure.closing_balance) >= Number(closure.opening_balance)
                ? 'text-green-700 dark:text-green-300'
                : 'text-orange-700 dark:text-orange-300'
            }`}>
              Saldo Final
            </p>
            <p className={`text-sm font-bold leading-tight ${
              Number(closure.closing_balance) >= Number(closure.opening_balance)
                ? 'text-green-900 dark:text-green-100'
                : 'text-orange-900 dark:text-orange-100'
            }`}>
              {formatCurrency(Number(closure.closing_balance))}
            </p>
          </div>
        </div>

        {/* Payment Methods Grid - More Compact */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-border/50">
            <Wallet className="w-3.5 h-3.5 text-muted-foreground" />
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wide">
              Métodos de Pagamento
            </h4>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Cash */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-1.5 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
                  <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                    Dinheiro
                  </p>
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 leading-tight">
                    {formatCurrency(Number(closure.cash_amount))}
                  </p>
                </div>
              </div>
            </div>

            {/* Card */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-1.5 bg-blue-500/10 dark:bg-blue-400/10 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                  <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                    Cartão
                  </p>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100 leading-tight">
                    {formatCurrency(Number(closure.card_amount))}
                  </p>
                </div>
              </div>
            </div>

            {/* PIX */}
            <div className="bg-gradient-to-br from-purple-50/80 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-1.5 bg-purple-500/10 dark:bg-purple-400/10 rounded-full border border-purple-200/50 dark:border-purple-700/50">
                  <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-purple-700 dark:text-purple-300 uppercase tracking-wide">
                    PIX
                  </p>
                  <p className="text-sm font-bold text-purple-900 dark:text-purple-100 leading-tight">
                    {formatCurrency(Number(closure.pix_amount))}
                  </p>
                </div>
              </div>
            </div>

            {/* Others */}
            <div className="bg-gradient-to-br from-orange-50/80 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/60 dark:border-orange-800/40 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-1.5 bg-orange-500/10 dark:bg-orange-400/10 rounded-full border border-orange-200/50 dark:border-orange-700/50">
                  <Calculator className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                    Outros
                  </p>
                  <p className="text-sm font-bold text-orange-900 dark:text-orange-100 leading-tight">
                    {formatCurrency(Number(closure.other_amount))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Difference Alert - More Compact */}
        {hasDifference && (
          <div className={`rounded-lg border p-3 ${
            difference > 0 
              ? 'bg-gradient-to-br from-emerald-50/80 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border-emerald-200/60 dark:border-emerald-800/40' 
              : 'bg-gradient-to-br from-red-50/80 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200/60 dark:border-red-800/40'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`flex-shrink-0 p-1.5 rounded-full border ${
                difference > 0 
                  ? 'bg-emerald-500/10 dark:bg-emerald-400/10 border-emerald-200/50 dark:border-emerald-700/50' 
                  : 'bg-red-500/10 dark:bg-red-400/10 border-red-200/50 dark:border-red-700/50'
              }`}>
                {difference > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-semibold mb-0.5 ${
                  difference > 0 
                    ? 'text-emerald-800 dark:text-emerald-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {difference > 0 ? 'Superávit no Caixa' : 'Déficit no Caixa'}
                </p>
                <p className={`text-sm font-bold ${
                  difference > 0 
                    ? 'text-emerald-900 dark:text-emerald-100' 
                    : 'text-red-900 dark:text-red-100'
                }`}>
                  {formatCurrency(difference)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section - More Compact */}
        {closure.notes && (
          <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 p-1.5 bg-amber-500/10 dark:bg-amber-400/10 rounded-full border border-amber-200/50 dark:border-amber-700/50">
                <StickyNote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  Observações
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  {closure.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata - More Compact */}
        {(closure.operator_id || closure.machine_id) && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border/50">
            {closure.operator_id && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium">Operador:</span>
                <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                  {closure.operator_id.slice(0, 8)}...
                </code>
              </div>
            )}
            {closure.machine_id && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium">Terminal:</span>
                <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                  {closure.machine_id.slice(-8)}
                </code>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashClosureCard;
