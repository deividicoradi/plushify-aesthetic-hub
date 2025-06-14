
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '../types';
import { formatDate, formatCurrency } from '../formatters';

export const addPaymentsSection = (doc: jsPDF, data: ReportData, yPosition: number, reportType: string): number => {
  if (reportType !== 'consolidado' && reportType !== 'pagamentos') {
    return yPosition;
  }

  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Pagamentos', 20, yPosition);
  yPosition += 5;

  if (data.payments.length > 0) {
    const paymentsData = data.payments.map(payment => [
      payment._deleted ? 'EXCLUÍDO' : formatDate(payment.created_at),
      payment.description || 'N/A',
      payment.clients?.name || 'N/A',
      payment.payment_methods?.name || 'N/A',
      formatCurrency(Number(payment.paid_amount || payment.amount)),
      payment._deleted ? 'Excluído' : payment.status,
      payment._deleted && payment._deleted_reason ? payment._deleted_reason : ''
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Data', 'Descrição', 'Cliente', 'Método', 'Valor', 'Status', 'Observações']],
      body: paymentsData,
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
      columnStyles: {
        6: { cellWidth: 30 } // Observações column
      },
      didParseCell: function(data) {
        // Destacar linhas de pagamentos excluídos
        const rowData = paymentsData[data.row.index];
        if (rowData && rowData[0] === 'EXCLUÍDO') {
          data.cell.styles.fillColor = [255, 235, 235]; // Light red background
          data.cell.styles.textColor = [150, 50, 50]; // Dark red text
        }
      }
    });

    return (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nenhum pagamento encontrado no período.', 20, yPosition);
    return yPosition + 15;
  }
};
