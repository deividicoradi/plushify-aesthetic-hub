import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, MailWarning, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FailedEmailRow {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
  resolution_note: string | null;
}

interface WebhookFailureRow {
  id: string;
  source: string;
  event_type: string | null;
  external_id: string | null;
  error_message: string;
  payload: Record<string, unknown> | null;
  created_at: string;
  resolved: boolean;
  resolved_at: string | null;
  resolution_note: string | null;
}

interface PendingIssues {
  failed_emails: FailedEmailRow[];
  failed_emails_count: number;
  webhook_failures: WebhookFailureRow[];
  webhook_failures_count: number;
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  failed: 'destructive',
  dlq: 'destructive',
  bounced: 'secondary',
  complained: 'secondary',
};

const STATUS_LABELS: Record<string, string> = {
  failed: 'Falhou',
  dlq: 'Fila morta (DLQ)',
  bounced: 'Rejeitado',
  complained: 'Marcado como spam',
};

type SelectedIssue =
  | { kind: 'email'; row: FailedEmailRow }
  | { kind: 'webhook'; row: WebhookFailureRow };

export const AdminPendingIssues: React.FC = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<SelectedIssue | null>(null);
  const [note, setNote] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-pending-issues'],
    queryFn: async (): Promise<PendingIssues> => {
      const { data, error } = await supabase.rpc('admin_get_pending_issues', { p_limit: 100 });
      if (error) throw error;
      return data as unknown as PendingIssues;
    },
    refetchInterval: 60_000,
  });

  const resolveMutation = useMutation({
    mutationFn: async (resolved: boolean) => {
      if (!selected) return;
      const rpcName = selected.kind === 'email' ? 'admin_set_email_failure_resolved' : 'admin_set_webhook_failure_resolved';
      const { error } = await supabase.rpc(rpcName, {
        p_id: selected.row.id,
        p_resolved: resolved,
        p_note: note.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, resolved) => {
      toast({ title: resolved ? 'Marcado como corrigido' : 'Marcado como não corrigido' });
      setSelected(null);
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-issues'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar', description: err.message, variant: 'destructive' });
    },
  });

  const openEmail = (row: FailedEmailRow) => {
    setSelected({ kind: 'email', row });
    setNote(row.resolution_note ?? '');
  };

  const openWebhook = (row: WebhookFailureRow) => {
    setSelected({ kind: 'webhook', row });
    setNote(row.resolution_note ?? '');
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <p className="text-destructive text-sm">Erro ao carregar pendências: {(error as Error).message}</p>;
  }

  const rows = data?.failed_emails ?? [];
  const webhookRows = data?.webhook_failures ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-wrap gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800 w-full sm:max-w-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">E-mails pendentes (30 dias)</CardTitle>
            <MailWarning className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">{data?.failed_emails_count ?? 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800 w-full sm:max-w-xs">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">Falhas de pagamento pendentes (30 dias)</CardTitle>
            <ShieldAlert className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">{data?.webhook_failures_count ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary" />
            Falhas no webhook de pagamento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Pagamentos recebidos da AbacatePay que não conseguiram ativar/revogar o plano do cliente nos últimos 30 dias.
            Clique numa linha pra ver detalhes e marcar como corrigido.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Referência</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quando</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhookRows.map((row) => (
                  <TableRow
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openWebhook(row)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openWebhook(row)}
                  >
                    <TableCell className="font-medium">{row.event_type ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[160px] truncate">{row.external_id ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[280px] truncate">{row.error_message}</TableCell>
                    <TableCell>
                      {row.resolved ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Corrigido</Badge>
                      ) : (
                        <Badge variant="destructive">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(row.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
                {webhookRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      Nenhuma falha de pagamento nos últimos 30 dias.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            E-mails com falha de envio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Falhas, rejeições e mensagens que caíram na fila morta (DLQ) nos últimos 30 dias.
            Clique numa linha pra ver detalhes e marcar como corrigido.
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead>Resolução</TableHead>
                  <TableHead>Quando</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => openEmail(row)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openEmail(row)}
                  >
                    <TableCell className="font-medium">{row.recipient_email}</TableCell>
                    <TableCell className="text-muted-foreground">{row.template_name}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[row.status] ?? 'outline'} className="whitespace-nowrap">
                        {STATUS_LABELS[row.status] ?? row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[220px] truncate">
                      {row.error_message ?? '—'}
                    </TableCell>
                    <TableCell>
                      {row.resolved ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Corrigido</Badge>
                      ) : (
                        <Badge variant="destructive">Pendente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(row.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      Nenhuma falha de e-mail nos últimos 30 dias.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span>{selected?.kind === 'email' ? 'Falha de e-mail' : 'Falha de webhook'}</span>
              {selected?.row.resolved ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white">Corrigido</Badge>
              ) : (
                <Badge variant="destructive">Pendente</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selected?.kind === 'email' && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Destinatário</p>
                <p className="font-medium">{selected.row.recipient_email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Modelo</p>
                <p className="font-medium">{selected.row.template_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge variant={STATUS_VARIANT[selected.row.status] ?? 'outline'}>
                  {STATUS_LABELS[selected.row.status] ?? selected.row.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Erro completo</p>
                <p className="rounded-md bg-muted/60 p-2.5 whitespace-pre-wrap break-words">{selected.row.error_message ?? '—'}</p>
              </div>
              {selected.row.message_id && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Message ID</p>
                  <p className="font-mono text-xs break-all">{selected.row.message_id}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Ocorreu em {new Date(selected.row.created_at).toLocaleString('pt-BR')}
                {selected.row.resolved_at && ` · Marcado como corrigido em ${new Date(selected.row.resolved_at).toLocaleString('pt-BR')}`}
              </p>
            </div>
          )}

          {selected?.kind === 'webhook' && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fonte</p>
                <p className="font-medium">{selected.row.source}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Evento</p>
                <p className="font-medium">{selected.row.event_type ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Referência (externalId)</p>
                <p className="font-mono text-xs break-all">{selected.row.external_id ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Erro completo</p>
                <p className="rounded-md bg-muted/60 p-2.5 whitespace-pre-wrap break-words">{selected.row.error_message}</p>
              </div>
              {!!selected.row.payload && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Payload recebido</p>
                  <pre className="rounded-md bg-muted/60 p-2.5 text-xs overflow-x-auto max-h-48 overflow-y-auto">
                    {JSON.stringify(selected.row.payload, null, 2)}
                  </pre>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Ocorreu em {new Date(selected.row.created_at).toLocaleString('pt-BR')}
                {selected.row.resolved_at && ` · Marcado como corrigido em ${new Date(selected.row.resolved_at).toLocaleString('pt-BR')}`}
              </p>
            </div>
          )}

          {selected && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground">Nota (opcional — o que foi feito pra corrigir)</p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: reenviei manualmente, cliente já tem acesso"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                {selected.row.resolved ? (
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={resolveMutation.isPending}
                    onClick={() => resolveMutation.mutate(false)}
                  >
                    Marcar como não corrigido
                  </Button>
                ) : (
                  <Button
                    className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                    disabled={resolveMutation.isPending}
                    onClick={() => resolveMutation.mutate(true)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como corrigido
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
