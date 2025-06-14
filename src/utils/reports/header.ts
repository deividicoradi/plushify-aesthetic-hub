
import jsPDF from 'jspdf';
import { ReportData } from './types';
import { formatDate } from './formatters';

export const addReportHeader = (doc: jsPDF, data: ReportData): number => {
  const pageWidth = doc.internal.pageSize.width;
  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.text('Relatório Financeiro', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setTextColor(100);
  const periodText = `Período: ${formatDate(data.period.from)} a ${formatDate(data.period.to)}`;
  doc.text(periodText, pageWidth / 2, yPosition, { align: 'center' });

  return yPosition + 15;
};
