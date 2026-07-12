import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Inbox } from 'lucide-react';
import type {
  FinancialDetails,
  PaymentRow,
  CashClosureRow,
  ExpenseRow,
  InstallmentRow,
} from '@/hooks/financial/useFinancialDetails';

export type MetricKey =
  | 'saldoLiquido'
  | 'totalReceitas'
  | 'totalDespesas'
  | 'parcelasVencidas'
  | 'ticketMedio'
  | 'receitasMes';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: MetricKey | null;
  details: FinancialDetails | null;
  loading: boolean;
  period: string;
}

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('pt-BR');
};

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
    <Inbox className="w-10 h-10 mb-2 opacity-50" />
    <p className="text-sm">{label}</p>
  </div>
);

const PaymentItem = ({ p }: { p: PaymentRow }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">{p.description || 'Pagamento'}</p>
      <p className="text-xs text-muted-foreground">{fmtDate(p.payment_date || p.created_at)}</p>
    </div>
    <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap ml-3">
      {fmtCurrency(Number(p.paid_amount ?? p.amount) || 0)}
    </span>
  </div>
);

const CashClosureItem = ({ c }: { c: CashClosureRow }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">Fechamento de caixa</p>
      <p className="text-xs text-muted-foreground">{fmtDate(c.closure_date)}</p>
    </div>
    <span className="text-sm font-semibold text-green-600 dark:text-green-400 whitespace-nowrap ml-3">
      {fmtCurrency(Number(c.total_income) || 0)}
    </span>
  </div>
);

const ExpenseItem = ({ e }: { e: ExpenseRow }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">{e.description || 'Despesa'}</p>
      <p className="text-xs text-muted-foreground">
        {fmtDate(e.expense_date)}
        {e.category ? ` · ${e.category}` : ''}
      </p>
    </div>
    <span className="text-sm font-semibold text-red-600 dark:text-red-400 whitespace-nowrap ml-3">
      {fmtCurrency(Number(e.amount) || 0)}
    </span>
  </div>
);

const InstallmentItem = ({ i }: { i: InstallmentRow }) => (
  <div className="flex items-center justify-between py-2 px-3 rounded-md border border-border bg-card/50">
    <div className="min-w-0">
      <p className="text-sm font-medium truncate">
        Parcela {i.installment_number ?? '?'}
        {i.total_installments ? ` / ${i.total_installments}` : ''}
      </p>
      <p className="text-xs text-muted-foreground">Venc.: {fmtDate(i.due_date)}</p>
    </div>
    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400 whitespace-nowrap ml-3">
      {fmtCurrency(Number(i.amount) || 0)}
    </span>
  </div>
);

type SortOrder = 'desc' | 'asc';
const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

interface Section<T = any> {
  key: string;
  title: string;
  total: number;
  items: T[];
  getDate: (item: T) => string | null | undefined;
  render: (item: T) => React.ReactNode;
}

const dateValue = (d?: string | null) => {
  if (!d) return 0;
  const t = new Date(d).getTime();
  return Number.isNaN(t) ? 0 : t;
};

function buildSections(metric: MetricKey, d: FinancialDetails): {
  title: string;
  description?: string;
  headerTotal: number;
  headerCount: number;
  totalLabel?: string;
  sections: Section[];
} {
  const sumPaid = (arr: PaymentRow[]) =>
    arr.reduce((s, p) => s + (Number(p.paid_amount) || 0), 0);
  const sumCash = (arr: CashClosureRow[]) =>
    arr.reduce((s, c) => s + (Number(c.total_income) || 0), 0);
  const sumExp = (arr: ExpenseRow[]) => arr.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const receitasTotal = sumPaid(d.paidPayments) + sumCash(d.cashClosures);
  const despesasTotal = sumExp(d.expenses);

  const paymentsSection = (
    list: PaymentRow[],
    key = 'payments',
    title = 'Pagamentos recebidos'
  ): Section<PaymentRow> => ({
    key,
    title,
    total: sumPaid(list),
    items: list,
    getDate: (p) => p.payment_date || p.created_at,
    render: (p) => <PaymentItem key={p.id} p={p} />,
  });
  const cashSection = (list: CashClosureRow[]): Section<CashClosureRow> => ({
    key: 'cash',
    title: 'Fechamentos de caixa',
    total: sumCash(list),
    items: list,
    getDate: (c) => c.closure_date,
    render: (c) => <CashClosureItem key={c.id} c={c} />,
  });
  const expensesSection = (list: ExpenseRow[]): Section<ExpenseRow> => ({
    key: 'expenses',
    title: 'Despesas',
    total: sumExp(list),
    items: list,
    getDate: (e) => e.expense_date,
    render: (e) => <ExpenseItem key={e.id} e={e} />,
  });

  switch (metric) {
    case 'saldoLiquido':
      return {
        title: 'Saldo Líquido',
        description: 'Receitas − Despesas no período selecionado.',
        headerTotal: receitasTotal - despesasTotal,
        headerCount:
          d.paidPayments.length + d.cashClosures.length + d.expenses.length,
        sections: [
          paymentsSection(d.paidPayments),
          cashSection(d.cashClosures),
          expensesSection(d.expenses),
        ],
      };
    case 'totalReceitas':
      return {
        title: 'Total de Receitas',
        description: 'Pagamentos recebidos e fechamentos de caixa no período.',
        headerTotal: receitasTotal,
        headerCount: d.paidPayments.length + d.cashClosures.length,
        sections: [paymentsSection(d.paidPayments), cashSection(d.cashClosures)],
      };
    case 'totalDespesas':
      return {
        title: 'Total de Despesas',
        description: 'Despesas registradas no período.',
        headerTotal: despesasTotal,
        headerCount: d.expenses.length,
        sections: [expensesSection(d.expenses)],
      };
    case 'parcelasVencidas': {
      const total = d.overdueInstallments.reduce(
        (s, i) => s + (Number(i.amount) || 0),
        0
      );
      return {
        title: 'Parcelas Vencidas',
        description: 'Parcelas pendentes cuja data de vencimento já passou.',
        headerTotal: total,
        headerCount: d.overdueInstallments.length,
        totalLabel: 'Valor em aberto',
        sections: [
          {
            key: 'installments',
            title: 'Parcelas',
            total,
            items: d.overdueInstallments,
            getDate: (i) => i.due_date,
            render: (i) => <InstallmentItem key={i.id} i={i} />,
          },
        ],
      };
    }
    case 'ticketMedio': {
      const list = d.paidPayments;
      const sumAmount = list.reduce((s, p) => s + (Number(p.amount) || 0), 0);
      const avg = list.length > 0 ? sumAmount / list.length : 0;
      return {
        title: 'Ticket Médio',
        description: `Média do valor (amount) dos pagamentos com status "pago" no período. Cálculo: soma dos valores ÷ quantidade de pagamentos (${fmtCurrency(
          sumAmount
        )} ÷ ${list.length || 0}).`,
        headerTotal: avg,
        headerCount: list.length,
        totalLabel: 'Ticket médio',
        sections: [paymentsSection(list, 'payments', 'Pagamentos considerados')],
      };
    }
    case 'receitasMes':
      return {
        title: 'Receitas do Mês',
        description: 'Receitas registradas desde o primeiro dia do mês atual (dentro do período filtrado).',
        headerTotal:
          sumPaid(d.currentMonthPaidPayments) + sumCash(d.currentMonthCashClosures),
        headerCount:
          d.currentMonthPaidPayments.length + d.currentMonthCashClosures.length,
        sections: [
          paymentsSection(d.currentMonthPaidPayments),
          cashSection(d.currentMonthCashClosures),
        ],
      };
  }
}

function SectionView({
  section,
  sortOrder,
  pageSize,
}: {
  section: Section;
  sortOrder: SortOrder;
  pageSize: PageSize;
}) {
  const [page, setPage] = React.useState(1);

  const sorted = React.useMemo(() => {
    const arr = [...section.items];
    arr.sort((a, b) => {
      const da = dateValue(section.getDate(a));
      const db = dateValue(section.getDate(b));
      return sortOrder === 'desc' ? db - da : da - db;
    });
    return arr;
  }, [section, sortOrder]);

  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  React.useEffect(() => {
    setPage(1);
  }, [sortOrder, pageSize, section.key, totalCount]);

  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = sorted.slice(start, start + pageSize);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{section.title}</h4>
        <span className="text-xs text-muted-foreground">
          {totalCount} {totalCount === 1 ? 'registro' : 'registros'} · {fmtCurrency(section.total)}
        </span>
      </div>
      {totalCount === 0 ? (
        <p className="text-xs text-muted-foreground py-2">Nenhum registro.</p>
      ) : (
        <>
          <div className="space-y-1.5">{visible.map((item) => section.render(item))}</div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {start + 1}–{Math.min(start + pageSize, totalCount)} de {totalCount}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </Button>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const MetricDetailsModal: React.FC<Props> = ({
  open,
  onOpenChange,
  metric,
  details,
  loading,
  period,
}) => {
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
  const [pageSize, setPageSize] = React.useState<PageSize>(20);

  React.useEffect(() => {
    if (open) {
      setSortOrder('desc');
    }
  }, [open, metric]);

  if (!metric) return null;

  const built = details ? buildSections(metric, details) : null;
  const allEmpty = built ? built.sections.every((s) => s.items.length === 0) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <DialogTitle>{built?.title ?? 'Detalhes'}</DialogTitle>
            <Badge variant="outline" className="text-xs">Período: {period}</Badge>
          </div>
          {built?.description && (
            <DialogDescription>{built.description}</DialogDescription>
          )}
        </DialogHeader>

        {loading || !built ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  {built.totalLabel ?? 'Total'}
                </p>
                <p className="text-xl font-bold">{fmtCurrency(built.headerTotal)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Registros</p>
                <p className="text-xl font-bold">{built.headerCount}</p>
              </div>
            </div>

            {!allEmpty && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
                  title="Alternar ordenação por data"
                >
                  {sortOrder === 'desc' ? (
                    <ArrowDownWideNarrow className="w-4 h-4 mr-1.5" />
                  ) : (
                    <ArrowUpWideNarrow className="w-4 h-4 mr-1.5" />
                  )}
                  {sortOrder === 'desc' ? 'Mais recentes' : 'Mais antigos'}
                </Button>
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-xs text-muted-foreground">Por página</span>
                  <Select
                    value={String(pageSize)}
                    onValueChange={(v) => setPageSize(Number(v) as PageSize)}
                  >
                    <SelectTrigger className="h-8 w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <ScrollArea className="flex-1 -mx-2 px-2">
              <div className="space-y-5 py-3">
                {allEmpty ? (
                  <EmptyState label="Nenhum registro encontrado para este período." />
                ) : (
                  built.sections.map((s) => (
                    <SectionView
                      key={s.key}
                      section={s}
                      sortOrder={sortOrder}
                      pageSize={pageSize}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};