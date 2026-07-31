import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, MailWarning } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface FailedEmailRow {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface PendingIssues {
  failed_emails: FailedEmailRow[];
  failed_emails_count: number;
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

export const AdminPendingIssues: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-pending-issues'],
    queryFn: async (): Promise<PendingIssues> => {
      const { data, error } = await supabase.rpc('admin_get_pending_issues', { p_limit: 100 });
      if (error) throw error;
      return data as unknown as PendingIssues;
    },
    refetchInterval: 60_000,
  });

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/30 dark:to-pink-950/30 border-red-200 dark:border-red-800 w-full sm:max-w-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-300">E-mails com falha (30 dias)</CardTitle>
          <MailWarning className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">{data?.failed_emails_count ?? 0}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            E-mails com falha de envio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Falhas, rejeições e mensagens que caíram na fila morta (DLQ) nos últimos 30 dias — antes só apareciam nos logs de produção.
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
                  <TableHead>Quando</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.recipient_email}</TableCell>
                    <TableCell className="text-muted-foreground">{row.template_name}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[row.status] ?? 'outline'}>
                        {STATUS_LABELS[row.status] ?? row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[280px] truncate">
                      {row.error_message ?? '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(row.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                      Nenhuma falha de e-mail nos últimos 30 dias.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
