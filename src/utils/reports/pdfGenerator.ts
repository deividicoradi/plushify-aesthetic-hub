
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ReportData } from './types';
import { addReportHeader } from './header';
import { addReportFooter } from './footer';
import { addExecutiveSummary } from './sections/executiveSummary';
import { addPaymentsSection } from './sections/paymentsSection';
import { addInstallmentsSection } from './sections/installmentsSection';
import { addExpensesSection } from './sections/expensesSection';
import { addCashClosuresSection } from './sections/cashClosuresSection';

export const generateFinancialReport = async (data: ReportData, reportType: string) => {
  const doc = new jsPDF();
  let yPosition = addReportHeader(doc, data);

  // Resumo Executivo
  if (reportType === 'consolidado') {
    yPosition = addExecutiveSummary(doc, data, yPosition);
  }

  // Seções do relatório
  yPosition = addPaymentsSection(doc, data, yPosition, reportType);
  yPosition = addInstallmentsSection(doc, data, yPosition, reportType);
  yPosition = addExpensesSection(doc, data, yPosition, reportType);
  yPosition = addCashClosuresSection(doc, data, yPosition, reportType);

  // Rodapé
  addReportFooter(doc);

  // Salvar o arquivo
  const fileName = `relatorio-financeiro-${format(new Date(data.period.from), 'yyyy-MM-dd')}-a-${format(new Date(data.period.to), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};
