
import * as XLSX from 'xlsx';
import { downloadFile, convertToCSV } from './fileUtils';

export interface ExportData {
  payments: any[];
  expenses: any[];
  installments: any[];
  cashClosures: any[];
  period: { from: string; to: string };
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includePayments: boolean;
  includeExpenses: boolean;
  includeInstallments: boolean;
  includeCashClosures: boolean;
  groupByCategory: boolean;
  groupByMethod: boolean;
}

export const exportFinancialData = async (data: ExportData, options: ExportOptions, fileName?: string) => {
  const timestamp = new Date().toISOString().slice(0, 16).replace(/:/g, '-');
  const baseFileName = fileName || `relatorio-financeiro-${timestamp}`;

  if (options.format === 'csv') {
    await exportToCSV(data, options, baseFileName);
  } else if (options.format === 'excel') {
    await exportToExcel(data, options, baseFileName);
  }
};

const exportToCSV = async (data: ExportData, options: ExportOptions, fileName: string) => {
  let allData: any[] = [];

  if (options.includePayments && data.payments.length > 0) {
    const paymentsData = data.payments.map(p => ({
      Tipo: 'Receita',
      Descrição: p.description,
      Cliente: p.clients?.name || 'N/A',
      Valor: Number(p.paid_amount || 0),
      'Método de Pagamento': p.payment_methods?.name || 'N/A',
      Data: new Date(p.created_at).toLocaleDateString('pt-BR'),
      Status: p.status
    }));
    allData = [...allData, ...paymentsData];
  }

  if (options.includeExpenses && data.expenses.length > 0) {
    const expensesData = data.expenses.map(e => ({
      Tipo: 'Despesa',
      Descrição: e.description,
      Cliente: 'N/A',
      Valor: -Number(e.amount),
      'Método de Pagamento': e.payment_methods?.name || 'N/A',
      Data: new Date(e.expense_date).toLocaleDateString('pt-BR'),
      Status: 'Pago',
      Categoria: e.category
    }));
    allData = [...allData, ...expensesData];
  }

  if (options.includeInstallments && data.installments.length > 0) {
    const installmentsData = data.installments.map(i => ({
      Tipo: 'Parcela',
      Descrição: i.payments?.description || 'Parcela',
      Cliente: 'N/A',
      Valor: Number(i.amount),
      'Método de Pagamento': i.payments?.payment_methods?.name || 'N/A',
      Data: new Date(i.due_date).toLocaleDateString('pt-BR'),
      Status: i.status,
      'Número da Parcela': `${i.installment_number}/${i.total_installments}`
    }));
    allData = [...allData, ...installmentsData];
  }

  const csvContent = convertToCSV(allData);
  downloadFile(csvContent, `${fileName}.csv`, 'text/csv');
};

const exportToExcel = async (data: ExportData, options: ExportOptions, fileName: string) => {
  const workbook = XLSX.utils.book_new();

  // Aba de Resumo
  const summaryData = [
    ['Resumo Financeiro'],
    ['Período', `${new Date(data.period.from).toLocaleDateString('pt-BR')} - ${new Date(data.period.to).toLocaleDateString('pt-BR')}`],
    [''],
    ['Total Receitas', data.payments.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0)],
    ['Total Despesas', data.expenses.reduce((sum, e) => sum + Number(e.amount), 0)],
    ['Saldo Líquido', data.payments.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) - data.expenses.reduce((sum, e) => sum + Number(e.amount), 0)],
    ['Parcelas Pendentes', data.installments.filter(i => i.status === 'pendente').length],
    ['Parcelas Vencidas', data.installments.filter(i => new Date(i.due_date) < new Date() && i.status === 'pendente').length]
  ];

  const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Resumo');

  // Aba de Pagamentos
  if (options.includePayments && data.payments.length > 0) {
    const paymentsData = data.payments.map(p => ({
      ID: p.id,
      Descrição: p.description,
      Cliente: p.clients?.name || 'N/A',
      Valor: Number(p.paid_amount || 0),
      'Valor Total': Number(p.amount),
      Desconto: Number(p.discount || 0),
      'Método de Pagamento': p.payment_methods?.name || 'N/A',
      'Data de Criação': new Date(p.created_at).toLocaleDateString('pt-BR'),
      'Data de Pagamento': p.payment_date ? new Date(p.payment_date).toLocaleDateString('pt-BR') : 'N/A',
      Status: p.status,
      Observações: p.notes || ''
    }));

    const paymentsWorksheet = XLSX.utils.json_to_sheet(paymentsData);
    XLSX.utils.book_append_sheet(workbook, paymentsWorksheet, 'Pagamentos');
  }

  // Aba de Despesas
  if (options.includeExpenses && data.expenses.length > 0) {
    const expensesData = data.expenses.map(e => ({
      ID: e.id,
      Descrição: e.description,
      Categoria: e.category,
      Valor: Number(e.amount),
      'Método de Pagamento': e.payment_methods?.name || 'N/A',
      'Data da Despesa': new Date(e.expense_date).toLocaleDateString('pt-BR'),
      Observações: e.notes || '',
      'Comprovante': e.receipt_url ? 'Sim' : 'Não'
    }));

    const expensesWorksheet = XLSX.utils.json_to_sheet(expensesData);
    XLSX.utils.book_append_sheet(workbook, expensesWorksheet, 'Despesas');
  }

  // Aba de Parcelamentos
  if (options.includeInstallments && data.installments.length > 0) {
    const installmentsData = data.installments.map(i => ({
      ID: i.id,
      'Pagamento Original': i.payments?.description || 'N/A',
      'Parcela': `${i.installment_number}/${i.total_installments}`,
      Valor: Number(i.amount),
      'Valor Pago': Number(i.paid_amount),
      'Data de Vencimento': new Date(i.due_date).toLocaleDateString('pt-BR'),
      'Data de Pagamento': i.payment_date ? new Date(i.payment_date).toLocaleDateString('pt-BR') : 'N/A',
      Status: i.status,
      Observações: i.notes || ''
    }));

    const installmentsWorksheet = XLSX.utils.json_to_sheet(installmentsData);
    XLSX.utils.book_append_sheet(workbook, installmentsWorksheet, 'Parcelamentos');
  }

  // Aba de Análise por Categoria (se solicitado)
  if (options.groupByCategory) {
    const categoryAnalysis = new Map<string, { receitas: number; despesas: number }>();

    data.expenses.forEach(e => {
      const category = e.category || 'Outros';
      const current = categoryAnalysis.get(category) || { receitas: 0, despesas: 0 };
      current.despesas += Number(e.amount);
      categoryAnalysis.set(category, current);
    });

    const categoryData = Array.from(categoryAnalysis.entries()).map(([category, values]) => ({
      Categoria: category,
      Receitas: values.receitas,
      Despesas: values.despesas,
      Saldo: values.receitas - values.despesas
    }));

    const categoryWorksheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categoryWorksheet, 'Por Categoria');
  }

  // Aba de Análise por Método de Pagamento (se solicitado)
  if (options.groupByMethod) {
    const methodAnalysis = new Map<string, { receitas: number; despesas: number }>();

    data.payments.forEach(p => {
      const method = p.payment_methods?.name || 'Outros';
      const current = methodAnalysis.get(method) || { receitas: 0, despesas: 0 };
      current.receitas += Number(p.paid_amount || 0);
      methodAnalysis.set(method, current);
    });

    data.expenses.forEach(e => {
      const method = e.payment_methods?.name || 'Outros';
      const current = methodAnalysis.get(method) || { receitas: 0, despesas: 0 };
      current.despesas += Number(e.amount);
      methodAnalysis.set(method, current);
    });

    const methodData = Array.from(methodAnalysis.entries()).map(([method, values]) => ({
      'Método de Pagamento': method,
      Receitas: values.receitas,
      Despesas: values.despesas,
      Saldo: values.receitas - values.despesas
    }));

    const methodWorksheet = XLSX.utils.json_to_sheet(methodData);
    XLSX.utils.book_append_sheet(workbook, methodWorksheet, 'Por Método');
  }

  // Salvar o arquivo
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const generateComparativeReport = (currentData: ExportData, previousData: ExportData) => {
  const currentReceitas = currentData.payments.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
  const previousReceitas = previousData.payments.reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
  
  const currentDespesas = currentData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const previousDespesas = previousData.expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const crescimentoReceitas = previousReceitas > 0 ? ((currentReceitas - previousReceitas) / previousReceitas) * 100 : 0;
  const crescimentoDespesas = previousDespesas > 0 ? ((currentDespesas - previousDespesas) / previousDespesas) * 100 : 0;

  return {
    periodo: {
      atual: currentData.period,
      anterior: previousData.period
    },
    receitas: {
      atual: currentReceitas,
      anterior: previousReceitas,
      crescimento: crescimentoReceitas,
      diferenca: currentReceitas - previousReceitas
    },
    despesas: {
      atual: currentDespesas,
      anterior: previousDespesas,
      crescimento: crescimentoDespesas,
      diferenca: currentDespesas - previousDespesas
    },
    saldoLiquido: {
      atual: currentReceitas - currentDespesas,
      anterior: previousReceitas - previousDespesas,
      crescimento: (previousReceitas - previousDespesas) > 0 ? 
        (((currentReceitas - currentDespesas) - (previousReceitas - previousDespesas)) / (previousReceitas - previousDespesas)) * 100 : 0,
      diferenca: (currentReceitas - currentDespesas) - (previousReceitas - previousDespesas)
    }
  };
};
