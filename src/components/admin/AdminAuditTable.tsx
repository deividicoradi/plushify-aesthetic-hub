import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ArrowRight, FileText, TrendingUp, DollarSign, ShieldAlert, Download } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { convertToCSV, downloadFile } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';
import { AdminManageAdmins } from './AdminManageAdmins';
import { AdminLoginLog } from './AdminLoginLog';

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

interface ActionLogRow {
  id: string;
  admin_email: string;
  target_email: string;
  action: string;
  reason: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
  total_count: number;
}

const ACTION_LABELS: Record<string, string> = {
  extend_trial: 'Estendeu trial',
  force_cancel: 'Cancelou assinatura',
  promote_admin: 'Promoveu a admin',
  revoke_admin: 'Revogou admin',
  create_coupon: 'Criou cupom',
};

const PLAN_LABELS: Record<string, string> = {
  professional: 'Profissional',
  premium: 'Premium',
};

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const PAGE_SIZE = 25;

const EXPORT_CAP = 2000;

export const AdminAuditTable: React.FC = () => {
  const [page, setPage] = useState(0);
  const [actionsPage, setActionsPage] = useState(0);
  const [isExportingConsents, setIsExportingConsents] = useState(false);
  const [isExportingActions, setIsExportingActions] = useState(false);
  const { toast } = useToast();

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

  const { data: actionsData, isLoading: actionsLoading } = useQuery({
    queryKey: ['admin-actions-log', actionsPage],
    queryFn: async (): Promise<ActionLogRow[]> => {
      const { data, error } = await supabase.rpc('admin_list_actions_log', {
        p_limit: PAGE_SIZE,
        p_offset: actionsPage * PAGE_SIZE,
      });
      if (error) throw error;
      return (data ?? []) as ActionLogRow[];
    },
  });

  const actionsTotalCount = actionsData?.[0]?.total_count ?? 0;
  const actionsTotalPages = Math.max(1, Math.ceil(actionsTotalCount / PAGE_SIZE));

  const totalCount = data?.[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rows = data ?? [];
  const creditSum = rows.reduce((acc, r) => acc + (r.credit_cents ?? 0), 0);
  const chargedSum = rows.reduce((acc, r) => acc + (r.charge_now_cents ?? 0), 0);

  const exportConsents = async () => {
    setIsExportingConsents(true);
    try {
      const { data: exportData, error } = await supabase.rpc('admin_list_upgrade_consents', {
        p_limit: EXPORT_CAP,
        p_offset: 0,
      });
      if (error) throw error;
      const rowsToExport = (exportData ?? []) as ConsentRow[];
      if (rowsToExport.length === 0) {
        toast({ title: 'Nada para exportar' });
        return;
      }
      const csv = convertToCSV(
        rowsToExport.map((r) => ({
          email: r.email,
          plano_anterior: PLAN_LABELS[r.previous_plan_type] ?? r.previous_plan_type,
          plano_novo: PLAN_LABELS[r.new_plan_type] ?? r.new_plan_type,
          credito_cents: r.credit_cents,
          valor_cobrado_cents: r.charge_now_cents,
          aceito_em: r.accepted_at,
        })),
      );
      downloadFile(csv, `upgrades_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    } catch (err) {
      toast({ title: 'Erro ao exportar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsExportingConsents(false);
    }
  };

  const exportActions = async () => {
    setIsExportingActions(true);
    try {
      const { data: exportData, error } = await supabase.rpc('admin_list_actions_log', {
        p_limit: EXPORT_CAP,
        p_offset: 0,
      });
      if (error) throw error;
      const rowsToExport = (exportData ?? []) as ActionLogRow[];
      if (rowsToExport.length === 0) {
        toast({ title: 'Nada para exportar' });
        return;
      }
      const csv = convertToCSV(
        rowsToExport.map((r) => ({
          admin: r.admin_email,
          acao: ACTION_LABELS[r.action] ?? r.action,
          cliente: r.target_email,
          motivo: r.reason ?? '',
          quando: r.created_at,
        })),
      );
      downloadFile(csv, `acoes_admin_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
    } catch (err) {
      toast({ title: 'Erro ao exportar', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsExportingActions(false);
    }
  };

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
  if (error) return <p className="text-destructive text-sm">Erro ao carregar auditoria: {(error as Error).message}</p>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <AdminManageAdmins />

      <AdminLoginLog />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Upgrades registrados</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{totalCount}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 hidden sm:block">Aceites confirmados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Cobrado nesta página</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{formatBRL(chargedSum)}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-2 hidden sm:block">Somatório dos aceites</p>
          </CardContent>
        </Card>

        <Card className="col-span-2 lg:col-span-1 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">Créditos aplicados</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">{formatBRL(creditSum)}</div>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 hidden sm:block">Proporcional do plano anterior</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Auditoria de upgrades
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              Registro auditável de todo upgrade de plano confirmado — comprova o valor exibido e aceito por cada cliente.
            </p>
          </div>
          <Button size="sm" variant="outline" disabled={isExportingConsents} onClick={exportConsents}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
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
                <TableCell className="text-green-600 dark:text-green-400">− {formatBRL(row.credit_cents)}</TableCell>
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
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              Ações administrativas
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1.5">
              Toda ação manual feita por um admin em conta de cliente (estender trial, cancelar) fica registrada aqui.
            </p>
          </div>
          <Button size="sm" variant="outline" disabled={isExportingActions} onClick={exportActions}>
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admin</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Quando</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(actionsData ?? []).map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-muted-foreground">{row.admin_email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ACTION_LABELS[row.action] ?? row.action}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{row.target_email}</TableCell>
                        <TableCell className="text-muted-foreground max-w-[220px] truncate">{row.reason ?? '—'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(row.created_at).toLocaleString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(actionsData ?? []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                          Nenhuma ação administrativa registrada ainda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Página {actionsPage + 1} de {actionsTotalPages} — {actionsTotalCount} registros
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={actionsPage === 0} onClick={() => setActionsPage((p) => p - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={actionsPage + 1 >= actionsTotalPages}
                    onClick={() => setActionsPage((p) => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
