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
    <Card className="w-full overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Modern Header */}
      <CardHeader className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-b border-border/50 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-3 bg-primary/10 rounded-xl border border-primary/20">
              <DoorOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xl font-bold text-foreground mb-1">
                Abertura de Caixa
              </CardTitle>
              <p className="text-base font-semibold text-primary">
                {format(new Date(opening.opening_date), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(new Date(opening.opened_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={opening.status === 'aberto' ? 'default' : 'secondary'}
              className={`px-3 py-1.5 font-medium ${
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
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(opening)} className="gap-2">
                      <Edit className="h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(opening.id)}
                      className="gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Main Balance Card */}
        <div className="relative overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 via-blue-50/80 to-indigo-50 dark:from-blue-950/30 dark:via-blue-900/20 dark:to-indigo-950/30 border border-blue-200/60 dark:border-blue-800/50 rounded-xl p-6 text-center shadow-sm">
            <div className="flex justify-center mb-3">
              <div className="p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wide">
              Saldo Inicial
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 leading-tight">
              {formatCurrency(Number(opening.opening_balance))}
            </p>
          </div>
        </div>

        {/* Payment Methods Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-border/50">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Métodos de Pagamento
            </h4>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cash */}
            <div className="bg-gradient-to-br from-emerald-50/80 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full border border-emerald-200/50 dark:border-emerald-700/50">
                  <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1">
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
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-2.5 bg-blue-500/10 dark:bg-blue-400/10 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
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
            <div className="bg-gradient-to-br from-purple-50/80 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-200/60 dark:border-purple-800/40 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-2.5 bg-purple-500/10 dark:bg-purple-400/10 rounded-full border border-purple-200/50 dark:border-purple-700/50">
                  <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="space-y-1">
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
            <div className="bg-gradient-to-br from-orange-50/80 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/60 dark:border-orange-800/40 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-2.5 bg-orange-500/10 dark:bg-orange-400/10 rounded-full border border-orange-200/50 dark:border-orange-700/50">
                  <Calculator className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="space-y-1">
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

        {/* Notes Section */}
        {opening.notes && (
          <div className="bg-gradient-to-br from-amber-50/80 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 p-2 bg-amber-500/10 dark:bg-amber-400/10 rounded-full border border-amber-200/50 dark:border-amber-700/50">
                <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Observações
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  {opening.notes}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        {(opening.operator_id || opening.machine_id) && (
          <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
            {opening.operator_id && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Operador:</span>
                <code className="px-2 py-0.5 bg-muted rounded text-xs">
                  {opening.operator_id.slice(0, 8)}...
                </code>
              </div>
            )}
            {opening.machine_id && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium">Terminal:</span>
                <code className="px-2 py-0.5 bg-muted rounded text-xs">
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
