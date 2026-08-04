import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Handshake, Plus, AlertTriangle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { ProspectFormDialog } from './prospects/ProspectFormDialog';
import { ProspectDetailDialog } from './prospects/ProspectDetailDialog';
import { ProspectorsManageDialog } from './prospects/ProspectorsManageDialog';
import {
  Prospect,
  ProspectStatus,
  StaleProspect,
  ProspectMetrics,
  ProspectorStats,
  STATUS_LABELS,
  STATUS_CLASS,
} from './prospects/types';

const STATUS_FILTER_LABELS: Record<ProspectStatus | 'todos', string> = {
  todos: 'Todos os status',
  ...STATUS_LABELS,
};

const MONTH_LABELS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const buildMonthOptions = () => {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({ value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: `${MONTH_LABELS[d.getMonth()]} de ${d.getFullYear()}` });
  }
  return options;
};

export const AdminProspects: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ProspectStatus | 'todos'>('todos');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null);
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [prospectorsOpen, setProspectorsOpen] = useState(false);
  const monthOptions = buildMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);

  const { data: prospects, isLoading } = useQuery({
    queryKey: ['admin-prospects', statusFilter],
    queryFn: async (): Promise<Prospect[]> => {
      const { data, error } = await supabase.rpc('admin_list_prospects', {
        p_status: statusFilter === 'todos' ? null : statusFilter,
      });
      if (error) throw error;
      return (data || []) as Prospect[];
    },
  });

  const { data: staleProspects, isLoading: isLoadingStale } = useQuery({
    queryKey: ['admin-prospects-stale'],
    queryFn: async (): Promise<StaleProspect[]> => {
      const { data, error } = await supabase.rpc('admin_get_stale_prospects');
      if (error) throw error;
      return (data || []) as StaleProspect[];
    },
  });

  const [year, month] = selectedMonth.split('-').map(Number);
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['admin-prospects-metrics', selectedMonth],
    queryFn: async (): Promise<ProspectMetrics | null> => {
      const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase.rpc('admin_get_prospect_metrics', {
        p_start_date: startDate,
        p_end_date: endDate,
      });
      if (error) throw error;
      return (data?.[0] ?? null) as ProspectMetrics | null;
    },
  });

  const { data: prospectorStats, isLoading: isLoadingProspectorStats } = useQuery({
    queryKey: ['admin-prospector-stats', selectedMonth],
    queryFn: async (): Promise<ProspectorStats[]> => {
      const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase.rpc('admin_get_prospector_stats', {
        p_start_date: startDate,
        p_end_date: endDate,
      });
      if (error) throw error;
      return (data || []) as ProspectorStats[];
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-prospects'] });
    queryClient.invalidateQueries({ queryKey: ['admin-prospects-stale'] });
    queryClient.invalidateQueries({ queryKey: ['admin-prospects-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['admin-prospector-stats'] });
  };

  const handleSelect = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setDetailOpen(true);
  };

  const handleSelectById = (id: string) => {
    const found = prospects?.find((p) => p.id === id);
    if (found) handleSelect(found);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="lista">
        <TabsList>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <Handshake className="w-4 h-4 shrink-0" />
            <span>Prospects</span>
          </TabsTrigger>
          <TabsTrigger value="followup" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Follow-up</span>
          </TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="space-y-4 mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProspectStatus | 'todos')}>
              <SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_FILTER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" onClick={() => setProspectorsOpen(true)} className="gap-2 flex-1 sm:flex-none">
                <Users className="w-4 h-4" />
                Equipe
              </Button>
              <Button onClick={() => { setEditingProspect(null); setFormOpen(true); }} className="gap-2 flex-1 sm:flex-none">
                <Plus className="w-4 h-4" />
                Novo prospect
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !prospects || prospects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Nenhum prospect cadastrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Plano de interesse</TableHead>
                    <TableHead>Prospectando</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último contato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prospects.map((p) => (
                    <TableRow key={p.id} role="button" className="cursor-pointer hover:bg-accent/50" onClick={() => handleSelect(p)}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.phone || '—'}</TableCell>
                      <TableCell className="capitalize">{p.origin || '—'}</TableCell>
                      <TableCell className="capitalize">{p.plan_interest || '—'}</TableCell>
                      <TableCell>{p.prospector_name || '—'}</TableCell>
                      <TableCell><Badge className={`${STATUS_CLASS[p.status]} whitespace-nowrap`}>{STATUS_LABELS[p.status]}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.last_contact_at ? new Date(p.last_contact_at).toLocaleDateString('pt-BR') : 'Sem contato'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="followup" className="space-y-2 mt-4">
          <p className="text-sm text-muted-foreground">
            Prospects sem contato há 90+ dias (atenção) ou 180+ dias (crítico), ainda não convertidos nem perdidos.
          </p>
          {isLoadingStale ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : !staleProspects || staleProspects.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">Nenhum prospect parado. Tudo em dia!</Card>
          ) : (
            staleProspects.map((item) => (
              <Card key={item.id} role="button" className="p-3 flex items-center justify-between cursor-pointer hover:bg-accent/50" onClick={() => handleSelectById(item.id)}>
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${item.urgency === 'critico' ? 'text-destructive' : 'text-amber-500'}`} />
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.phone || 'Sem telefone'} · {item.days_since_contact} dias sem contato</p>
                  </div>
                </div>
                <Badge className={item.urgency === 'critico' ? 'bg-destructive/15 text-destructive' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}>
                  {item.urgency === 'critico' ? 'Crítico' : 'Atenção'}
                </Badge>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="metricas" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isLoadingMetrics ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          ) : !metrics ? (
            <p className="text-sm text-muted-foreground text-center py-6">Não foi possível carregar as métricas.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card><CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Prospectados</p>
                <p className="text-2xl font-bold">{metrics.total_prospected}</p>
              </CardContent></Card>
              <Card className="border-emerald-600/30"><CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Taxa de conversão</p>
                <p className="text-2xl font-bold text-emerald-600">{metrics.conversion_rate}%</p>
                <p className="text-xs text-muted-foreground">{metrics.total_converted} convertidos</p>
              </CardContent></Card>
              <Card className="border-destructive/30"><CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Taxa de perda</p>
                <p className="text-2xl font-bold text-destructive">{metrics.loss_rate}%</p>
                <p className="text-xs text-muted-foreground">{metrics.total_lost} perdidos</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Em aberto</p>
                <p className="text-2xl font-bold">{metrics.total_open}</p>
                <p className="text-xs text-muted-foreground">ainda no funil</p>
              </CardContent></Card>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-semibold">Por pessoa</h3>
            {isLoadingProspectorStats ? (
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : !prospectorStats || prospectorStats.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Ninguém cadastrado na equipe ainda.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Prospectados</TableHead>
                      <TableHead>Convertidos</TableHead>
                      <TableHead>Perdidos</TableHead>
                      <TableHead>Taxa de conversão</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prospectorStats.map((s) => (
                      <TableRow key={s.prospector_id}>
                        <TableCell className="font-medium">{s.prospector_name}</TableCell>
                        <TableCell>{s.total_prospected}</TableCell>
                        <TableCell>{s.total_converted}</TableCell>
                        <TableCell>{s.total_lost}</TableCell>
                        <TableCell>{s.conversion_rate}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <ProspectFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        prospect={editingProspect}
        onSuccess={() => { refresh(); toast.success(editingProspect ? 'Prospect atualizado!' : 'Prospect cadastrado!'); }}
      />

      <ProspectDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        prospect={selectedProspect}
        onChanged={refresh}
      />

      <ProspectorsManageDialog
        open={prospectorsOpen}
        onOpenChange={setProspectorsOpen}
        onChanged={refresh}
      />
    </div>
  );
};
