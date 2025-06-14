
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '../types';
import { formatCurrency } from '../formatters';

export const addExecutiveSummary = (doc: jsPDF, data: ReportData, yPosition: number): number => {
  // Calcular receitas incluindo pagamentos realizados + fechamentos de caixa
  const totalReceitasFromPayments = data.payments
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
  
  const totalReceitasFromCashClosures = data.cashClosures
    .reduce((sum, c) => sum + Number(c.total_income || 0), 0);
  
  const totalReceitas = totalReceitasFromPayments + totalReceitasFromCashClosures;
  const totalDespesas = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const saldoLiquido = totalReceitas - totalDespesas;

  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Resumo Executivo', 20, yPosition);
  yPosition += 10;

  const resumoData = [
    ['Total de Receitas', formatCurrency(totalReceitas)],
    ['Total de Despesas', formatCurrency(totalDespesas)],
    ['Saldo Líquido', formatCurrency(saldoLiquido)],
    ['Número de Pagamentos', data.payments.length.toString()],
    ['Número de Despesas', data.expenses.length.toString()],
    ['Número de Fechamentos', data.cashClosures.length.toString()],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [['Métrica', 'Valor']],
    body: resumoData,
    theme: 'grid',
    headStyles: { fillColor: [63, 81, 181] },
    margin: { left: 20, right: 20 },
  });

  return (doc as any).lastAutoTable.finalY + 15;
};
