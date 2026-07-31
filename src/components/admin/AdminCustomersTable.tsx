import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Users, CheckCircle2, Clock, Search, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { AdminCustomerDetailModal } from './AdminCustomerDetailModal';

interface CustomerRow {
  user_id: string;
  email: string;
  plan_type: string | null;
  status: string;
  billing_interval: string | null;
  payment_kind: string | null;
  started_at: string | null;
  expires_at: string | null;
  trial_ends_at: string | null;
  signed_up_at: string;
  last_sign_in_at: string | null;
  total_count: number;
}

const RISK_THRESHOLD_DAYS = 14;

const isAtRisk = (row: CustomerRow) => {
  if (row.status !== 'active' || row.plan_type === 'trial' || !row.plan_type) return false;
  if (!row.last_sign_in_at) return true;
  const daysSince = (Date.now() - new Date(row.last_sign_in_at).getTime()) / 86_400_000;
  return daysSince > RISK_THRESHOLD_DAYS;
};

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial',
  professional: 'Profissional',
  premium: 'Premium',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  cancelled: 'secondary',
  refunded: 'destructive',
  disputed: 'destructive',
  sem_plano: 'outline',
};

const PAGE_SIZE = 25;

export const AdminCustomersTable: React.FC = () => {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: async (): Promise<CustomerRow[]> => {
      const { data, error } = await supabase.rpc('admin_list_customers', {
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
        p_search: search || null,
      });
      if (error) throw error;
      return (data ?? []) as CustomerRow[];
    },
  });

  const totalCount = data?.[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rows = data ?? [];
  const activeCount = rows.filter((r) => r.status === 'active').length;
  const trialCount = rows.filter((r) => r.plan_type === 'trial').length;

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  if (error) return <p className="text-destructive text-sm">Erro ao carregar clientes: {(error as Error).message}</p>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Total de clientes</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{totalCount}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 hidden sm:block">Contas registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Ativos nesta página</CardTitle>
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{activeCount}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 hidden sm:block">Assinaturas ativas</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Em trial</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">{trialCount}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 hidden sm:block">Período de teste</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por e-mail..."
              className="pl-8 pr-8"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Último acesso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((row) => (
              <TableRow
                key={row.user_id}
                className="cursor-pointer"
                onClick={() => setSelectedUserId(row.user_id)}
              >
                <TableCell className="font-medium">{row.email}</TableCell>
                <TableCell>{row.plan_type ? (PLAN_LABELS[row.plan_type] ?? row.plan_type) : '—'}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[row.status] ?? 'outline'}>{row.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.payment_kind ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(row.signed_up_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span>{row.last_sign_in_at ? new Date(row.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}</span>
                    {isAtRisk(row) && (
                      <Badge variant="destructive" className="text-[10px]">Risco</Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {(data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Página {page + 1} de {totalPages} — {totalCount} clientes
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
          </div>
        </CardContent>
      </Card>

      <AdminCustomerDetailModal
        userId={selectedUserId}
        onOpenChange={(open) => !open && setSelectedUserId(null)}
      />
    </div>
  );
};
