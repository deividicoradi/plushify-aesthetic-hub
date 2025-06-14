
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DoorOpen, Edit, Trash2, Calculator } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MetricCard from './MetricCard';

interface CashOpeningCardProps {
  opening: any;
  onEdit: (opening: any) => void;
  onDelete: (openingId: string) => void;
}

const CashOpeningCard = ({ opening, onEdit, onDelete }: CashOpeningCardProps) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberto: { label: 'Aberto', variant: 'secondary' as const },
      fechado: { label: 'Fechado', variant: 'default' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberto;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DoorOpen className="w-5 h-5" />
              Abertura - {format(new Date(opening.opening_date), 'dd/MM/yyyy', { locale: ptBR })}
            </CardTitle>
            <div className="mt-2">
              {getStatusBadge(opening.status)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Aberto em: {format(new Date(opening.opened_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(opening)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(opening.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <MetricCard
            title="Saldo Inicial"
            value={Number(opening.opening_balance)}
            icon={Calculator}
          />
          
          <MetricCard
            title="Dinheiro"
            value={Number(opening.cash_amount)}
            icon={Calculator}
          />
          
          <MetricCard
            title="Cartão"
            value={Number(opening.card_amount)}
            icon={Calculator}
          />
          
          <MetricCard
            title="PIX"
            value={Number(opening.pix_amount)}
            icon={Calculator}
          />
          
          <MetricCard
            title="Outros"
            value={Number(opening.other_amount)}
            icon={Calculator}
          />
        </div>

        {opening.notes && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-800/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Observações:</strong> {opening.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CashOpeningCard;
