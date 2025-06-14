
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportData {
  payments: any[];
  installments: any[];
  expenses: any[];
  cashClosures: any[];
  period: {
    from: string;
    to: string;
  };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
};

export const generateFinancialReport = async (data: ReportData, reportType: string) => {
  const doc = new jsPDF();
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

  yPosition += 15;

  // Resumo Executivo
  if (reportType === 'consolidado') {
    // Calcular receitas incluindo pagamentos realizados + fechamentos de caixa
    const totalReceitasFromPayments = data.payments
      .filter(p => p.status === 'pago')
      .reduce((sum, p) => sum + Number(p.paid_amount || 0), 0);
    
    const totalReceitasFromCashClosures = data.cashClosures
      .reduce((sum, c) => sum + Number(c.total_income || 0), 0);
    
    const totalReceitas = totalReceitasFromPayments + totalReceitasFromCashClosures;
    const totalDespesas = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const saldoLiquido = totalReceitas - totalDespesas;

    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('Resumo Executivo', 20, yPosition);
    yPosition += 10;

    const resumoData = [
      ['Total de Receitas', formatCurrency(totalReceitas)],
      ['Total de Despesas', formatCurrency(totalDespesas)],
      ['Saldo Líquido', formatCurrency(saldoLiquido)],
      ['Número de Pagamentos', data.payments.length.toString()],
      ['Número de Despesas', data.expenses.length.toString()],
      ['Número de Fechamentos', data.cashClosures.length.toString()],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [['Métrica', 'Valor']],
      body: resumoData,
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Seção de Pagamentos
  if (reportType === 'consolidado' || reportType === 'pagamentos') {
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
        formatDate(payment.created_at),
        payment.description || 'N/A',
        payment.clients?.name || 'N/A',
        payment.payment_methods?.name || 'N/A',
        formatCurrency(Number(payment.amount)),
        payment.status
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Data', 'Descrição', 'Cliente', 'Método', 'Valor', 'Status']],
        body: paymentsData,
        theme: 'striped',
        headStyles: { fillColor: [76, 175, 80] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Nenhum pagamento encontrado no período.', 20, yPosition);
      yPosition += 15;
    }
  }

  // Seção de Parcelamentos
  if (reportType === 'consolidado' || reportType === 'parcelamentos') {
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
        installment.status,
        installment.payment_date ? formatDate(installment.payment_date) : 'N/A'
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Vencimento', 'Descrição', 'Parcela', 'Valor', 'Status', 'Pago em']],
        body: installmentsData,
        theme: 'striped',
        headStyles: { fillColor: [255, 152, 0] },
        margin: { left: 20, right: 20 },
        styles: { fontSize: 8 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Nenhum parcelamento encontrado no período.', 20, yPosition);
      yPosition += 15;
    }
  }

  // Seção de Despesas
  if (reportType === 'consolidado' || reportType === 'despesas') {
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

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Nenhuma despesa encontrada no período.', 20, yPosition);
      yPosition += 15;
    }
  }

  // Seção de Fechamentos de Caixa
  if (reportType === 'consolidado' || reportType === 'fechamentos') {
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

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Nenhum fechamento de caixa encontrado no período.', 20, yPosition);
      yPosition += 15;
    }
  }

  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Relatório gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`,
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

  // Salvar o arquivo
  const fileName = `relatorio-financeiro-${format(new Date(data.period.from), 'yyyy-MM-dd')}-a-${format(new Date(data.period.to), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};
