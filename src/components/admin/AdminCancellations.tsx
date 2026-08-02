import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserMinus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface CancellationRow {
  subscription_id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  user_phone: string | null;
  plan_type: string | null;
  billing_interval: string | null;
  status: string;
  cancel_at_period_end: boolean;
  plan_amount_paid: number | null;
  started_at: string;
  expires_at: string | null;
  updated_at: string;
  reason: string | null;
  comment: string | null;
  feedback_created_at: string | null;
  deleted_email_before: string | null;
  deleted_at: string | null;
}

const REASON_LABELS: Record<string, string> = {
  preco: 'O preço está acima do que eu esperava',
  pouco_uso: 'Não estou usando o suficiente',
  faltou_recurso: 'Faltou uma funcionalidade que eu precisava',
  encontrei_outro: 'Encontrei outra ferramenta',
  problema_tecnico: 'Tive problemas técnicos',
  outro: 'Outro motivo',
};

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial',
  professional: 'Profissional',
  premium: 'Premium',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativo (aguardando)',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  disputed: 'Contestado',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'outline',
  cancelled: 'secondary',
  refunded: 'destructive',
  disputed: 'destructive',
};

const formatBRL = (cents: number | null) =>
  cents == null ? '—' : (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const kindLabel = (row: CancellationRow) => {
  if (row.status === 'refunded') return 'Reembolso';
  if (row.status === 'disputed') return 'Disputa';
  if (row.status === 'active' && row.cancel_at_period_end) return row.billing_interval === 'year' ? 'Cancelamento anual (pendente)' : 'Cancelamento mensal';
  return 'Cancelamento';
};

export const AdminCancellations: React.FC = () => {
  const [selected, setSelected] = useState<CancellationRow | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-cancellations-and-refunds'],
    queryFn: async (): Promise<CancellationRow[]> => {
      const { data, error } = await supabase.rpc('admin_list_cancellations_and_refunds');
      if (error) throw error;
      return (data ?? []) as CancellationRow[];
    },
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserMinus className="w-4 h-4 text-primary" />
            Cancelamentos e reembolsos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : error ? (
            <p className="text-destructive text-sm">Erro ao carregar: {(error as Error).message}</p>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((row) => (
                    <TableRow
                      key={row.subscription_id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelected(row)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(row)}
                    >
                      <TableCell className="font-medium">
                        {row.deleted_email_before ? (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Badge variant="destructive" className="text-[10px]">Conta excluída</Badge>
                            </div>
                            <div className="text-xs">{row.deleted_email_before}</div>
                          </>
                        ) : (
                          <>
                            <div>{row.user_name || '—'}</div>
                            <div className="text-xs text-muted-foreground">{row.user_email}</div>
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.user_phone || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{kindLabel(row)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.plan_type ? (PLAN_LABELS[row.plan_type] ?? row.plan_type) : '—'}
                        {row.billing_interval ? ` · ${row.billing_interval === 'year' ? 'Anual' : 'Mensal'}` : ''}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatBRL(row.plan_amount_paid)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[row.status] ?? 'outline'}>{STATUS_LABELS[row.status] ?? row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(row.updated_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(data ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        Nenhum cancelamento ou reembolso ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span>{selected?.deleted_email_before || selected?.user_name || selected?.user_email}</span>
              {selected?.deleted_email_before && (
                <Badge variant="destructive" className="text-[10px]">Conta excluída</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              {selected.deleted_email_before && (
                <p className="text-xs text-muted-foreground rounded-md bg-destructive/10 p-2">
                  Essa conta foi excluída pelo cliente{selected.deleted_at ? ` em ${new Date(selected.deleted_at).toLocaleString('pt-BR')}` : ''}.
                  Use o e-mail original acima pra contato — o e-mail de login foi anonimizado.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">E-mail {selected.deleted_email_before ? 'original' : ''}</p>
                  <p className="font-medium break-all">{selected.deleted_email_before || selected.user_email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                  <p className="font-medium">{selected.user_phone || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                  <p className="font-medium">{kindLabel(selected)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={STATUS_VARIANT[selected.status] ?? 'outline'}>{STATUS_LABELS[selected.status] ?? selected.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Plano</p>
                  <p className="font-medium">
                    {selected.plan_type ? (PLAN_LABELS[selected.plan_type] ?? selected.plan_type) : '—'}
                    {selected.billing_interval ? ` · ${selected.billing_interval === 'year' ? 'Anual' : 'Mensal'}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Valor pago</p>
                  <p className="font-medium">{formatBRL(selected.plan_amount_paid)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Início</p>
                  <p className="font-medium">{new Date(selected.started_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expira</p>
                  <p className="font-medium">{selected.expires_at ? new Date(selected.expires_at).toLocaleDateString('pt-BR') : '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Motivo informado pelo cliente</p>
                <p className="font-medium">
                  {selected.reason ? (REASON_LABELS[selected.reason] ?? selected.reason) : 'Não informado'}
                </p>
              </div>

              {selected.comment && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Comentário do cliente</p>
                  <p className="rounded-md bg-muted/60 p-2.5">{selected.comment}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {selected.feedback_created_at
                  ? `Pedido feito em ${new Date(selected.feedback_created_at).toLocaleString('pt-BR')}`
                  : `Última atualização em ${new Date(selected.updated_at).toLocaleString('pt-BR')}`}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
