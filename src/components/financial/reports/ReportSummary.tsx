
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportData } from '@/utils/reports/types';

interface ReportSummaryProps {
  reportData: ReportData;
}

export const ReportSummary = ({ reportData }: ReportSummaryProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular totais incluindo pagamentos excluídos
  const totalReceitasFromPayments = reportData.payments.reduce((sum, p) => {
    // Não contar pagamentos excluídos no total de receitas
    if (p._deleted) return sum;
    const amount = Number(p.paid_amount || p.amount) || 0;
    console.log('💵 Adicionando ao total de receitas (pagamento):', amount);
    return sum + amount;
  }, 0);

  const totalReceitasFromCashClosures = reportData.cashClosures.reduce((sum, c) => {
    const amount = Number(c.total_income) || 0;
    console.log('🏦 Adicionando ao total de receitas (fechamento):', amount);
    return sum + amount;
  }, 0);

  const totalReceitas = totalReceitasFromPayments + totalReceitasFromCashClosures;
  const totalDespesas = reportData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const parcelasVencidas = reportData.installments.filter(i => 
    new Date(i.due_date) < new Date() && i.status === 'pendente'
  ).length;
  const pagamentosExcluidos = reportData.payments.filter(p => p._deleted).length;

  console.log('📊 Totais calculados:', { totalReceitas, totalDespesas, parcelasVencidas, pagamentosExcluidos });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do Período</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalReceitas)}
            </div>
            <div className="text-sm text-muted-foreground">Total Receitas</div>
          </div>

          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalDespesas)}
            </div>
            <div className="text-sm text-muted-foreground">Total Despesas</div>
          </div>

          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(totalReceitas - totalDespesas)}
            </div>
            <div className="text-sm text-muted-foreground">Saldo Líquido</div>
          </div>

          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {parcelasVencidas}
            </div>
            <div className="text-sm text-muted-foreground">Parcelas Vencidas</div>
          </div>

          <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {pagamentosExcluidos}
            </div>
            <div className="text-sm text-muted-foreground">Pagamentos Excluídos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
