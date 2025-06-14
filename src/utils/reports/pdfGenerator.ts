
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
  try {
    console.log('📋 Iniciando geração do PDF...');
    console.log('📊 Dados recebidos:', data);
    console.log('📄 Tipo:', reportType);

    const doc = new jsPDF();
    console.log('📄 jsPDF inicializado');

    let yPosition = addReportHeader(doc, data);
    console.log('📋 Cabeçalho adicionado, posição Y:', yPosition);

    // Resumo Executivo
    if (reportType === 'consolidado') {
      console.log('📊 Adicionando resumo executivo...');
      yPosition = addExecutiveSummary(doc, data, yPosition);
      console.log('📊 Resumo executivo adicionado, posição Y:', yPosition);
    }

    // Seções do relatório
    console.log('💰 Adicionando seção de pagamentos...');
    yPosition = addPaymentsSection(doc, data, yPosition, reportType);
    console.log('💰 Seção de pagamentos adicionada, posição Y:', yPosition);

    console.log('📊 Adicionando seção de parcelamentos...');
    yPosition = addInstallmentsSection(doc, data, yPosition, reportType);
    console.log('📊 Seção de parcelamentos adicionada, posição Y:', yPosition);

    console.log('💸 Adicionando seção de despesas...');
    yPosition = addExpensesSection(doc, data, yPosition, reportType);
    console.log('💸 Seção de despesas adicionada, posição Y:', yPosition);

    console.log('🏦 Adicionando seção de fechamentos...');
    yPosition = addCashClosuresSection(doc, data, yPosition, reportType);
    console.log('🏦 Seção de fechamentos adicionada, posição Y:', yPosition);

    // Rodapé
    console.log('📄 Adicionando rodapé...');
    addReportFooter(doc);
    console.log('📄 Rodapé adicionado');

    // Salvar o arquivo
    const fileName = `relatorio-financeiro-${format(new Date(data.period.from), 'yyyy-MM-dd')}-a-${format(new Date(data.period.to), 'yyyy-MM-dd')}.pdf`;
    console.log('💾 Salvando arquivo:', fileName);
    
    doc.save(fileName);
    console.log('✅ Arquivo salvo com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a geração do PDF:', error);
    console.error('❌ Stack trace completo:', error.stack);
    throw error;
  }
};
