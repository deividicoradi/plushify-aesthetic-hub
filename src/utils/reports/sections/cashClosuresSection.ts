
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '../types';
import { formatDate, formatCurrency } from '../formatters';

export const addCashClosuresSection = (doc: jsPDF, data: ReportData, yPosition: number, reportType: string): number => {
  if (reportType !== 'consolidado' && reportType !== 'fechamentos') {
    return yPosition;
  }

  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Fechamentos de Caixa', 20, yPosition);
  yPosition += 5;

  if (data.cashClosures.length > 0) {
    const closuresData = data.cashClosures.map(closure => [
      formatDate(closure.closure_date),
      formatCurrency(Number(closure.opening_balance)),
      formatCurrency(Number(closure.total_income)),
      formatCurrency(Number(closure.total_expenses)),
      formatCurrency(Number(closure.closing_balance)),
      closure.status
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Data', 'Saldo Inicial', 'Receitas', 'Despesas', 'Saldo Final', 'Status']],
      body: closuresData,
      theme: 'striped',
      headStyles: { fillColor: [96, 125, 139] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
    });

    return (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nenhum fechamento de caixa encontrado no período.', 20, yPosition);
    return yPosition + 15;
  }
};
