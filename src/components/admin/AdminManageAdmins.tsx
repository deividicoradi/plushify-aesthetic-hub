import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldPlus, ShieldMinus, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminRow {
  user_id: string;
  email: string;
  granted_by_email: string | null;
  granted_at: string;
}

export const AdminManageAdmins: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-list-admins'],
    queryFn: async (): Promise<AdminRow[]> => {
      const { data, error } = await supabase.rpc('admin_list_admins');
      if (error) throw error;
      return (data ?? []) as AdminRow[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-list-admins'] });
    queryClient.invalidateQueries({ queryKey: ['admin-actions-log'] });
  };

  const promoteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('admin_promote_to_admin', { p_email: email.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: `${email.trim()} agora é administrador` });
      setEmail('');
      invalidate();
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao promover', description: err.message, variant: 'destructive' });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase.rpc('admin_revoke_admin', { p_user_id: targetUserId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Acesso de administrador revogado' });
      invalidate();
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao revogar', description: err.message, variant: 'destructive' });
    },
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Administradores
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quem tem acesso a este painel. Só um admin existente pode promover outro — o e-mail precisa já ter uma conta criada no app.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[220px] space-y-1">
            <label className="text-xs text-muted-foreground">E-mail do novo admin</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pessoa@exemplo.com"
              className="h-9"
            />
          </div>
          <Button
            size="sm"
            disabled={promoteMutation.isPending || !email.trim()}
            onClick={() => promoteMutation.mutate()}
          >
            <ShieldPlus className="w-4 h-4 mr-1.5" />
            Promover
          </Button>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!!error && <p className="text-destructive text-sm">Erro: {(error as Error).message}</p>}

        {data && (
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Concedido por</TableHead>
                  <TableHead>Desde</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => {
                  const isSelf = row.user_id === user?.id;
                  return (
                    <TableRow key={row.user_id}>
                      <TableCell className="font-medium">{row.email}</TableCell>
                      <TableCell className="text-muted-foreground">{row.granted_by_email ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(row.granted_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">Você</span>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" disabled={revokeMutation.isPending}>
                                <ShieldMinus className="w-3.5 h-3.5 mr-1.5" />
                                Revogar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revogar admin de {row.email}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa pessoa perde acesso a este painel imediatamente. A ação fica registrada na auditoria.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => revokeMutation.mutate(row.user_id)}>
                                  Confirmar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
