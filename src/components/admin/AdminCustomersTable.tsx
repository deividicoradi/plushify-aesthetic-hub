import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

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
  total_count: number;
}

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

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customers', page],
    queryFn: async (): Promise<CustomerRow[]> => {
      const { data, error } = await supabase.rpc('admin_list_customers', {
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      });
      if (error) throw error;
      return (data ?? []) as CustomerRow[];
    },
  });

  const totalCount = data?.[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (isLoading) return <p className="text-muted-foreground">Carregando clientes...</p>;
  if (error) return <p className="text-destructive text-sm">Erro ao carregar clientes: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Expira em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((row) => (
              <TableRow key={row.user_id}>
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
                  {row.expires_at ? new Date(row.expires_at).toLocaleDateString('pt-BR') : '—'}
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
    </div>
  );
};
