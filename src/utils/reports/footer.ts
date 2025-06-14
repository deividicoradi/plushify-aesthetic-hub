
import jsPDF from 'jspdf';
import { formatDateTime } from './formatters';

export const addReportFooter = (doc: jsPDF): void => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Relatório gerado em ${formatDateTime(new Date())}`,
      20,
      doc.internal.pageSize.height - 10
    );
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }
};
