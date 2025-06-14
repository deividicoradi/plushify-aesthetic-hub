
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReportData, Payment, Installment } from '@/utils/reports/types';

interface ReportPreviewProps {
  reportData: ReportData;
  reportType: string;
}

export const ReportPreview = ({ reportData, reportType }: ReportPreviewProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid gap-4">
      {(reportType === 'consolidado' || reportType === 'pagamentos') && (
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos ({reportData.payments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reportData.payments.slice(0, 5).map((payment: Payment) => (
                <div key={payment.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {payment.description}
                      {payment._deleted && (
                        <Badge variant="destructive" className="text-xs">
                          Excluído
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {payment.clients?.name || 'Cliente não informado'}
                      {payment._deleted && payment._deleted_reason && (
                        <span className="block text-red-500">
                          Motivo: {payment._deleted_reason}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={payment._deleted ? "destructive" : "default"}>
                    {formatCurrency(Number(payment.paid_amount || payment.amount))}
                  </Badge>
                </div>
              ))}
              {reportData.payments.length > 5 && (
                <div className="text-sm text-muted-foreground text-center">
                  +{reportData.payments.length - 5} mais...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(reportType === 'consolidado' || reportType === 'parcelamentos') && (
        <Card>
          <CardHeader>
            <CardTitle>Parcelamentos ({reportData.installments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reportData.installments.slice(0, 5).map((installment: Installment) => (
                <div key={installment.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">
                      {installment.payments?.description || 'Parcelamento'} - 
                      Parcela {installment.installment_number}/{installment.total_installments}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Status: {installment.status === 'pago' ? 'Pago' : 'Pendente'}
                      {installment.payment_date && (
                        <span className="block">
                          Pago em: {format(new Date(installment.payment_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={installment.status === 'pago' ? "default" : "secondary"}>
                    {formatCurrency(Number(installment.amount))}
                  </Badge>
                </div>
              ))}
              {reportData.installments.length > 5 && (
                <div className="text-sm text-muted-foreground text-center">
                  +{reportData.installments.length - 5} mais...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(reportType === 'consolidado' || reportType === 'fechamentos') && (
        <Card>
          <CardHeader>
            <CardTitle>Fechamentos de Caixa ({reportData.cashClosures.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reportData.cashClosures.slice(0, 5).map((closure: any) => (
                <div key={closure.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">Fechamento de Caixa</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(closure.closure_date), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                  </div>
                  <Badge variant="default">
                    {formatCurrency(Number(closure.total_income))}
                  </Badge>
                </div>
              ))}
              {reportData.cashClosures.length > 5 && (
                <div className="text-sm text-muted-foreground text-center">
                  +{reportData.cashClosures.length - 5} mais...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(reportType === 'consolidado' || reportType === 'despesas') && (
        <Card>
          <CardHeader>
            <CardTitle>Despesas ({reportData.expenses.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {reportData.expenses.slice(0, 5).map((expense: any) => (
                <div key={expense.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground">{expense.category}</div>
                  </div>
                  <Badge variant="destructive">
                    {formatCurrency(Number(expense.amount))}
                  </Badge>
                </div>
              ))}
              {reportData.expenses.length > 5 && (
                <div className="text-sm text-muted-foreground text-center">
                  +{reportData.expenses.length - 5} mais...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
