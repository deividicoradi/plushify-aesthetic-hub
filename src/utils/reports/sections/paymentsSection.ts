
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
      payment._deleted ? 'EXCLUÍDO' : 
      payment.payment_date ? formatDate(payment.payment_date) : 
      formatDate(payment.created_at),
      payment.description || 'N/A',
      payment.clients?.name || 'N/A',
      payment.payment_methods?.name || 'N/A',
      formatCurrency(Number(payment.paid_amount || payment.amount)),
      payment._deleted ? 'Excluído' : 
      payment.status === 'pago' ? 'Pago' :
      payment.status === 'parcial' ? 'Parcial' :
      payment.status === 'pendente' ? 'Pendente' : 
      payment.status,
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
        const rowData = paymentsData[data.row.index];
        if (rowData) {
          // Destacar linhas de pagamentos excluídos
          if (rowData[0] === 'EXCLUÍDO') {
            data.cell.styles.fillColor = [255, 235, 235]; // Light red background
            data.cell.styles.textColor = [150, 50, 50]; // Dark red text
          }
          // Destacar pagamentos pagos
          else if (rowData[5] === 'Pago') {
            data.cell.styles.fillColor = [230, 255, 230]; // Light green background
            data.cell.styles.textColor = [50, 150, 50]; // Dark green text
          }
          // Destacar pagamentos parciais
          else if (rowData[5] === 'Parcial') {
            data.cell.styles.fillColor = [255, 248, 220]; // Light orange background
            data.cell.styles.textColor = [150, 100, 50]; // Dark orange text
          }
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
