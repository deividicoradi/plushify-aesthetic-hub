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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 text-lg font-semibold">
              <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
                <DoorOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div>Abertura de Caixa</div>
                <div className="text-base font-medium text-muted-foreground">
                  {format(new Date(opening.opening_date), 'dd/MM/yyyy', { locale: ptBR })}
                </div>
              </div>
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-3">
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
        
        {/* Informações adicionais */}
        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>Aberto em:</span>
            <span className="font-medium">
              {format(new Date(opening.opened_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </span>
          </div>
          {opening.operator_id && (
            <div className="flex items-center gap-1">
              <span>Operador:</span>
              <span className="font-medium">{opening.operator_id.slice(0, 8)}...</span>
            </div>
          )}
          {opening.machine_id && (
            <div className="flex items-center gap-1">
              <span>Terminal:</span>
              <span className="font-medium">{opening.machine_id.slice(-8)}</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Saldo Inicial Destacado */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Saldo Inicial</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(opening.opening_balance))}
            </p>
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Valores por Método de Pagamento
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <Calculator className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Dinheiro</p>
              <p className="font-semibold text-sm">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(opening.cash_amount))}
              </p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <Calculator className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Cartão</p>
              <p className="font-semibold text-sm">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(opening.card_amount))}
              </p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <Calculator className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">PIX</p>
              <p className="font-semibold text-sm">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(opening.pix_amount))}
              </p>
            </div>
            
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="flex justify-center mb-2">
                <Calculator className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Outros</p>
              <p className="font-semibold text-sm">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(opening.other_amount))}
              </p>
            </div>
          </div>
        </div>

        {/* Observações */}
        {opening.notes && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="p-1 bg-amber-100 dark:bg-amber-800/50 rounded">
                <Calculator className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">Observações:</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">{opening.notes}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashOpeningCard;
