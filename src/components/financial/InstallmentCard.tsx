
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  DollarSign, 
  Edit, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  XCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface InstallmentCardProps {
  installment: any;
  paymentData: any;
  onEdit: (installment: any) => void;
  onUpdate: () => void;
}

const InstallmentCard = ({ installment, paymentData, onEdit, onUpdate }: InstallmentCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status === 'pendente';
    
    const statusConfig = {
      pendente: { 
        label: isOverdue ? 'Atrasado' : 'Pendente', 
        variant: isOverdue ? 'destructive' as const : 'secondary' as const,
        icon: isOverdue ? AlertTriangle : Clock
      },
      pago: { label: 'Pago', variant: 'default' as const, icon: CheckCircle },
      cancelado: { label: 'Cancelado', variant: 'outline' as const, icon: Clock },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const handleMarkAsPaid = async () => {
    try {
      const { error } = await supabase
        .from('installments')
        .update({
          status: 'pago',
          payment_date: new Date().toISOString(),
          paid_amount: installment.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', installment.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Parcela marcada como paga.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar parcela",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsNotPaid = async () => {
    try {
      const { error } = await supabase
        .from('installments')
        .update({
          status: 'pendente',
          payment_date: null,
          paid_amount: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', installment.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Parcela marcada como não paga.",
      });

      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar parcela",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {installment.installment_number}
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="font-medium text-sm">
                Parcela {installment.installment_number}/{installment.total_installments}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {paymentData?.description || 'Pagamento'}
              </p>
            </div>
          </div>
          {getStatusBadge(installment.status, installment.due_date)}
        </div>

        <div className="space-y-2 mb-4 flex-grow">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-xs">Vence: {format(new Date(installment.due_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>

          {installment.payment_date && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">Pago em: {format(new Date(installment.payment_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <span className="font-medium text-sm">{formatCurrency(Number(installment.amount))}</span>
              {Number(installment.paid_amount) > 0 && installment.status !== 'pago' && (
                <div className="text-green-600 text-xs">
                  Pago: {formatCurrency(Number(installment.paid_amount))}
                </div>
              )}
            </div>
          </div>

          {installment.notes && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{installment.notes}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          {installment.status === 'pendente' ? (
            <Button
              size="sm"
              onClick={handleMarkAsPaid}
              className="w-full bg-green-600 hover:bg-green-700 text-xs h-8"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Marcar como Pago
            </Button>
          ) : (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleMarkAsNotPaid}
              className="w-full text-xs h-8"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Marcar como Não Pago
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(installment)}
            className="w-full text-xs h-8"
          >
            <Edit className="w-3 h-3 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallmentCard;
