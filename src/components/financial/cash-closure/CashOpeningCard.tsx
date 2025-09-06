import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DoorOpen, Calculator, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MetricCard from './MetricCard';

interface CashOpeningCardProps {
  opening: any;
  onEdit?: (opening: any) => void;
  onDelete?: (id: string) => void;
}

const CashOpeningCard = ({ opening, onEdit, onDelete }: CashOpeningCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberto: { label: 'Aberto', variant: 'secondary' as const, className: 'bg-green-500 text-white hover:bg-green-600' },
      fechado: { label: 'Fechado', variant: 'default' as const, className: '' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberto;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
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
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg shrink-0">
              <DoorOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Abertura de Caixa
              </CardTitle>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                {format(new Date(opening.opening_date), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 self-start">
            {getStatusBadge(opening.status)}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(opening)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(opening.id)}
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="shrink-0">Aberto em:</span>
            <span className="font-medium">
              {format(new Date(opening.opened_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {opening.operator_id && (
              <div className="flex items-center gap-2">
                <span>Operador:</span>
                <span className="font-medium">{opening.operator_id.slice(0, 8)}...</span>
              </div>
            )}
            {opening.machine_id && (
              <div className="flex items-center gap-2">
                <span>Terminal:</span>
                <span className="font-medium">{opening.machine_id.slice(-8)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Initial Balance - Highlighted */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Saldo Inicial</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100 break-words leading-tight">
              {formatCurrency(Number(opening.opening_balance))}
            </p>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b pb-2">
            Valores por Método de Pagamento
          </h4>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center space-y-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dinheiro</p>
                  <p className="text-sm font-bold text-foreground break-words leading-tight">
                    {formatCurrency(Number(opening.cash_amount))}
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
                  <p className="text-sm font-bold text-foreground break-words leading-tight">
                    {formatCurrency(Number(opening.card_amount))}
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
                  <p className="text-sm font-bold text-foreground break-words leading-tight">
                    {formatCurrency(Number(opening.pix_amount))}
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
                  <p className="text-sm font-bold text-foreground break-words leading-tight">
                    {formatCurrency(Number(opening.other_amount))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {opening.notes && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-full shrink-0">
                <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Observações:</p>
                <p className="text-sm text-amber-700 dark:text-amber-300 break-words">{opening.notes}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashOpeningCard;
