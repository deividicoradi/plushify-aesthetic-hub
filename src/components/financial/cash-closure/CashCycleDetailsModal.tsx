import React from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DetailsListModal, type DetailsSection } from '@/components/common/DetailsListModal';
import { useCashCycleDetails, type CashCyclePaymentRow, type CashCycleExpenseRow } from '@/hooks/financial/useCashCycleDetails';

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
const fmtTime = (d?: string | null) => (d ? format(new Date(d), 'HH:mm', { locale: ptBR }) : '—');

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
}

export const CashCycleDetailsModal: React.FC<Props> = ({ open, onOpenChange, date }) => {
  const { payments, expenses, loading } = useCashCycleDetails(date, open);

  const totalPayments = payments.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const sections: DetailsSection<any>[] = [
    {
      key: 'payments',
      title: 'Pagamentos recebidos',
      totalLabel: fmtBRL(totalPayments),
      items: payments,
      getDate: (p: CashCyclePaymentRow) => p.payment_date,
      render: (p: CashCyclePaymentRow) => (
        <div key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <div className="min-w-0">
            <p className="font-medium truncate">{p.description || 'Pagamento'}</p>
            <p className="text-xs text-muted-foreground truncate">
              {p.client_name || 'Sem cliente'} · {fmtTime(p.payment_date)}
              {p.payment_method_name ? ` · ${p.payment_method_name}` : ''}
            </p>
          </div>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap ml-3">
            {fmtBRL(Number(p.paid_amount) || 0)}
          </span>
        </div>
      ),
    },
    {
      key: 'expenses',
      title: 'Despesas',
      totalLabel: fmtBRL(totalExpenses),
      items: expenses,
      getDate: (e: CashCycleExpenseRow) => e.expense_date,
      render: (e: CashCycleExpenseRow) => (
        <div key={e.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <div className="min-w-0">
            <p className="font-medium truncate">{e.description}</p>
            <p className="text-xs text-muted-foreground truncate">
              {e.category} · {fmtTime(e.expense_date)}
              {e.payment_method_name ? ` · ${e.payment_method_name}` : ''}
            </p>
          </div>
          <span className="text-sm font-semibold text-red-500 whitespace-nowrap ml-3">
            {fmtBRL(Number(e.amount) || 0)}
          </span>
        </div>
      ),
    },
  ];

  return (
    <DetailsListModal
      open={open}
      onOpenChange={onOpenChange}
      title="Detalhe do dia"
      description={date ? format(parseISO(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : undefined}
      loading={loading}
      headerTotal={fmtBRL(totalPayments - totalExpenses)}
      headerTotalLabel="Saldo do dia (receitas − despesas)"
      headerCount={payments.length + expenses.length}
      sections={sections}
      emptyLabel="Nenhum pagamento ou despesa registrado nesse dia."
    />
  );
};
