
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MetricCard from './MetricCard';

interface CashClosureCardProps {
  closure: any;
  onEdit: (closure: any) => void;
  onDelete: (closureId: string) => void;
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Fechamento - {format(new Date(closure.closure_date), 'dd/MM/yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="mt-2">
              {getStatusBadge(closure.status)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-4">
              {closure.closed_at && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Fechado em: {format(new Date(closure.closed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(closure)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(closure.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Saldo Inicial"
            value={Number(closure.opening_balance)}
            icon={Calculator}
          />
          
          <MetricCard
            title="Total Receitas"
            value={Number(closure.total_income)}
            icon={TrendingUp}
            trend="up"
          />
          
          <MetricCard
            title="Total Despesas"
            value={Number(closure.total_expenses)}
            icon={TrendingDown}
            trend="down"
          />
          
          <MetricCard
            title="Saldo Final"
            value={Number(closure.closing_balance)}
            icon={Calculator}
            trend={Number(closure.closing_balance) > Number(closure.opening_balance) ? 'up' : 'down'}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Dinheiro</p>
            <p className="font-semibold">{formatCurrency(Number(closure.cash_amount))}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Cartão</p>
            <p className="font-semibold">{formatCurrency(Number(closure.card_amount))}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">PIX</p>
            <p className="font-semibold">{formatCurrency(Number(closure.pix_amount))}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Outros</p>
            <p className="font-semibold">{formatCurrency(Number(closure.other_amount))}</p>
          </div>
        </div>

        {Number(closure.difference) !== 0 && (
          <div className={`mt-4 p-3 rounded-lg ${
            Number(closure.difference) > 0 
              ? 'bg-green-50 dark:bg-green-800/20 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-800/20 text-red-800 dark:text-red-200'
          }`}>
            <p className="font-medium">
              Diferença: {formatCurrency(Number(closure.difference))}
            </p>
          </div>
        )}

        {closure.notes && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Observações:</strong> {closure.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashClosureCard;
