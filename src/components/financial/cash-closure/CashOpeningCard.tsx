import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DoorOpen, Calculator, Wallet, CreditCard, Smartphone, Banknote, MoreVertical, Edit, Trash2, StickyNote } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CashOpeningCardProps {
  opening: any;
  onEdit?: (opening: any) => void;
  onDelete?: (id: string) => void;
}

const CashOpeningCard = ({ opening, onEdit, onDelete }: CashOpeningCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card className="w-full overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300">
      {/* Compact Header */}
      <CardHeader className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg border border-primary/20">
              <DoorOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold text-foreground mb-0.5">
                Abertura de Caixa
              </CardTitle>
              <p className="text-sm font-semibold text-primary">
                {format(new Date(opening.opening_date), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(opening.opened_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={opening.status === 'aberto' ? 'default' : 'secondary'}
              className={`px-2 py-1 text-xs font-medium ${
                opening.status === 'aberto' 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : 'bg-gray-500 text-white'
              }`}
            >
              {opening.status === 'aberto' ? 'Aberto' : 'Fechado'}
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
                    <DropdownMenuItem onClick={() => onEdit(opening)} className="gap-2 text-xs">
                      <Edit className="h-3.5 w-3.5" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(opening.id)}
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
        {/* Main Balance Card - More Compact */}
        <div className="bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-800/50 rounded-lg p-4 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-full border border-blue-200/50 dark:border-blue-700/50">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 uppercase tracking-wide">
            Saldo Inicial
          </p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100 leading-tight">
            {formatCurrency(Number(opening.opening_balance))}
          </p>
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
                    {formatCurrency(Number(opening.cash_amount))}
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
                    {formatCurrency(Number(opening.card_amount))}
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
                    {formatCurrency(Number(opening.pix_amount))}
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
                    {formatCurrency(Number(opening.other_amount))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section - More Compact */}
        {opening.notes && (
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
                  {opening.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata - More Compact */}
        {(opening.operator_id || opening.machine_id) && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border/50">
            {opening.operator_id && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium">Operador:</span>
                <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                  {opening.operator_id.slice(0, 8)}...
                </code>
              </div>
            )}
            {opening.machine_id && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium">Terminal:</span>
                <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                  {opening.machine_id.slice(-8)}
                </code>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashOpeningCard;
