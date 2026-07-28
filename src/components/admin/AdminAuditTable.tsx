import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ConsentRow {
  id: string;
  email: string;
  previous_plan_type: string;
  new_plan_type: string;
  credit_cents: number;
  new_price_cents: number;
  charge_now_cents: number;
  accepted_at: string;
  total_count: number;
}

const PLAN_LABELS: Record<string, string> = {
  professional: 'Profissional',
  premium: 'Premium',
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PAGE_SIZE = 25;

export const AdminAuditTable: React.FC = () => {
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-upgrade-consents', page],
    queryFn: async (): Promise<ConsentRow[]> => {
      const { data, error } = await supabase.rpc('admin_list_upgrade_consents', {
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      });
      if (error) throw error;
      return (data ?? []) as ConsentRow[];
    },
  });

  const totalCount = data?.[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (isLoading) return <p className="text-muted-foreground">Carregando auditoria...</p>;
  if (error) return <p className="text-destructive text-sm">Erro ao carregar auditoria: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Registro auditável de todo upgrade de plano confirmado — comprova o valor exibido e aceito por cada cliente.
      </p>
      <div className="rounded-md border border-border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-mail</TableHead>
              <TableHead>Mudança</TableHead>
              <TableHead>Crédito aplicado</TableHead>
              <TableHead>Valor cobrado</TableHead>
              <TableHead>Aceito em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.email}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm">
                    <span>{PLAN_LABELS[row.previous_plan_type] ?? row.previous_plan_type}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-medium">{PLAN_LABELS[row.new_plan_type] ?? row.new_plan_type}</span>
                  </div>
                </TableCell>
                <TableCell className="text-emerald-600">− {formatBRL(row.credit_cents)}</TableCell>
                <TableCell className="font-medium">{formatBRL(row.charge_now_cents)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(row.accepted_at).toLocaleString('pt-BR')}
                </TableCell>
              </TableRow>
            ))}
            {(data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  Nenhum upgrade registrado ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Página {page + 1} de {totalPages} — {totalCount} registros
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
