import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Wallet, TrendingUp, AlertTriangle, TrendingDown } from 'lucide-react';
import {
  useAdminFinance,
  useAdminFinanceSummary,
  CATEGORY_LABELS,
  STATUS_LABELS,
  FinanceEntry,
  FinanceStatus,
  FinanceCategory,
} from '@/hooks/admin/useAdminFinance';
import { FinanceEntryFormDialog } from './finance/FinanceEntryFormDialog';
import { AdminFinanceNotes } from './finance/AdminFinanceNotes';
import { FinanceStatusDetailDialog } from './finance/FinanceStatusDetailDialog';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const STATUS_BADGE_CLASS: Record<FinanceStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  paid: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400',
};

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const monthRange = (month: string) => {
  const monthDate = new Date(`${month}-01T00:00:00`);
  const from = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().slice(0, 10);
  const to = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().slice(0, 10);
  return { from, to };
};

const DETAIL_TITLES: Record<FinanceStatus, string> = {
  pending: 'Pendente no mês',
  paid: 'Pago no mês',
  overdue: 'Vencido no mês',
  cancelled: 'Cancelado no mês',
};

export const AdminFinance: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<FinanceStatus | 'todos'>('todos');
  const [categoryFilter, setCategoryFilter] = useState<FinanceCategory | 'todas'>('todas');
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FinanceEntry | null>(null);
  const [detailStatus, setDetailStatus] = useState<FinanceStatus | null>(null);
  const month = currentMonth();
  const { from: monthFrom, to: monthTo } = monthRange(month);

  const { entries, loading, createEntry, updateEntry, markPaid, cancelEntry, deleteEntry } = useAdminFinance({
    status: statusFilter,
    category: categoryFilter,
  });
  const { summary } = useAdminFinanceSummary(month);

  const handleAdd = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const handleEdit = (entry: FinanceEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleSubmit = async (input: Parameters<typeof createEntry>[0]) => {
    if (editingEntry) return updateEntry(editingEntry.id, input);
    return createEntry(input);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card
          role="button"
          tabIndex={0}
          onClick={() => setDetailStatus('paid')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setDetailStatus('paid'))}
          className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Pago no mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-900 dark:text-green-100">
              {formatCurrency(summary?.totalPaid ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => setDetailStatus('pending')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setDetailStatus('pending'))}
          className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-amber-700 dark:text-amber-300">Pendente no mês</CardTitle>
            <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-amber-900 dark:text-amber-100">
              {formatCurrency(summary?.totalPending ?? 0)}
            </div>
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => setDetailStatus('overdue')}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setDetailStatus('overdue'))}
          className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800 col-span-2 lg:col-span-1"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">Vencido no mês</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-red-900 dark:text-red-100">
              {formatCurrency(summary?.totalOverdue ?? 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Contas a pagar / despesas
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FinanceStatus | 'todos')}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as FinanceCategory | 'todas')}>
                <SelectTrigger className="w-[170px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
            ) : entries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum lançamento encontrado.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {CATEGORY_LABELS[entry.category]}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(`${entry.due_date}T00:00:00`).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{formatCurrency(entry.amount)}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_BADGE_CLASS[entry.status]} variant="outline">
                            {STATUS_LABELS[entry.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(entry)}>Editar</DropdownMenuItem>
                              {entry.status === 'pending' || entry.status === 'overdue' ? (
                                <DropdownMenuItem onClick={() => markPaid(entry.id)}>
                                  Marcar como pago
                                </DropdownMenuItem>
                              ) : null}
                              {entry.status !== 'cancelled' && entry.status !== 'paid' && (
                                <DropdownMenuItem onClick={() => cancelEntry(entry.id)}>
                                  Cancelar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => deleteEntry(entry.id)}
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <AdminFinanceNotes />
      </div>

      <FinanceEntryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        entry={editingEntry}
      />

      <FinanceStatusDetailDialog
        status={detailStatus}
        title={detailStatus ? DETAIL_TITLES[detailStatus] : ''}
        from={monthFrom}
        to={monthTo}
        onOpenChange={(open) => !open && setDetailStatus(null)}
      />
    </div>
  );
};
