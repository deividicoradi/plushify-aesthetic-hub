
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportData } from '../types';
import { formatDate, formatCurrency } from '../formatters';

export const addInstallmentsSection = (doc: jsPDF, data: ReportData, yPosition: number, reportType: string): number => {
  if (reportType !== 'consolidado' && reportType !== 'parcelamentos') {
    return yPosition;
  }

  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.text('Parcelamentos', 20, yPosition);
  yPosition += 5;

  if (data.installments.length > 0) {
    const installmentsData = data.installments.map(installment => [
      formatDate(installment.due_date),
      installment.payments?.description || 'N/A',
      `${installment.installment_number}/${installment.total_installments}`,
      formatCurrency(Number(installment.amount)),
      installment.status === 'pago' ? 'Pago' : 
      installment.status === 'pendente' ? 'Pendente' : 
      installment.status,
      installment.payment_date ? formatDate(installment.payment_date) : 'N/A',
      installment.payments?.payment_methods?.name || 'N/A'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Vencimento', 'Descrição', 'Parcela', 'Valor', 'Status', 'Pago em', 'Método']],
      body: installmentsData,
      theme: 'striped',
      headStyles: { fillColor: [255, 152, 0] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
      didParseCell: function(data) {
        // Destacar parcelas pagas
        const rowData = installmentsData[data.row.index];
        if (rowData && rowData[4] === 'Pago') {
          data.cell.styles.fillColor = [230, 255, 230]; // Light green background
          data.cell.styles.textColor = [50, 150, 50]; // Dark green text
        }
      }
    });

    return (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Nenhum parcelamento encontrado no período.', 20, yPosition);
    return yPosition + 15;
  }
};
