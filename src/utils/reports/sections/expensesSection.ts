
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '../types';
import { formatDate, formatCurrency } from '../formatters';

export const addExpensesSection = (doc: jsPDF, data: ReportData, yPosition: number, reportType: string): number => {
  if (reportType !== 'consolidado' && reportType !== 'despesas') {
    return yPosition;
  }

  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Despesas', 20, yPosition);
  yPosition += 5;

  if (data.expenses.length > 0) {
    const expensesData = data.expenses.map(expense => [
      formatDate(expense.expense_date),
      expense.description,
      expense.category,
      expense.payment_methods?.name || 'N/A',
      formatCurrency(Number(expense.amount)),
      expense.notes || 'N/A'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Data', 'Descrição', 'Categoria', 'Método', 'Valor', 'Observações']],
      body: expensesData,
      theme: 'striped',
      headStyles: { fillColor: [244, 67, 54] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
    });

    return (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nenhuma despesa encontrada no período.', 20, yPosition);
    return yPosition + 15;
  }
};
