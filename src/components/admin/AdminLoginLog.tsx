import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LogIn, KeyRound } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface LoginLogRow {
  id: string;
  admin_email: string;
  action: string;
  ip_address: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
};

const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
};

export const AdminLoginLog: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-login-log'],
    queryFn: async (): Promise<LoginLogRow[]> => {
      const { data, error } = await supabase.rpc('admin_get_admin_login_log', { p_limit: 100 });
      if (error) throw error;
      return (data ?? []) as LoginLogRow[];
    },
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-primary" />
          Acessos ao painel
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Login/logout de quem tem acesso administrativo — IP e data de cada evento.
        </p>
      </CardHeader>
      <CardContent>
        {isLoading && <Skeleton className="h-40 w-full" />}
        {!!error && <p className="text-destructive text-sm">Erro: {(error as Error).message}</p>}
        {data && (
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Quando</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground">{maskEmail(row.admin_email)}</TableCell>
                    <TableCell>
                      <Badge variant={row.action === 'login' ? 'default' : 'secondary'}>
                        <LogIn className="w-3 h-3 mr-1" />
                        {ACTION_LABELS[row.action] ?? row.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{row.ip_address ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(row.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
                {data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                      Nenhum acesso registrado ainda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
