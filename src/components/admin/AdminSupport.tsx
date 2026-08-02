import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LifeBuoy, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SupportEventRow {
  id: string;
  event_number: number;
  user_email: string;
  title: string;
  description: string;
  event_type: string;
  status: string;
  priority: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  total_count: number;
}

interface SupportEventHistoryItem {
  old_status: string | null;
  new_status: string;
  note: string | null;
  changed_by_email: string | null;
  created_at: string;
}

interface SupportEventDetail extends Omit<SupportEventRow, 'total_count'> {
  history: SupportEventHistoryItem[];
}

const TYPE_LABELS: Record<string, string> = {
  melhoria: 'Melhoria',
  correcao: 'Correção',
  pequena_melhoria: 'Pequena melhoria',
  pequena_correcao: 'Pequena correção',
};

const STATUS_LABELS: Record<string, string> = {
  aberto: 'Aberto',
  em_analise: 'Em análise',
  em_correcao: 'Em correção',
  concluido: 'Concluído',
  fechado: 'Finalizado',
};

const STATUS_ORDER = ['aberto', 'em_analise', 'em_correcao', 'concluido', 'fechado'];

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  aberto: 'outline',
  em_analise: 'secondary',
  em_correcao: 'secondary',
  concluido: 'default',
  fechado: 'default',
};

const STATUS_CLASS: Record<string, string> = {
  concluido: 'bg-emerald-600 hover:bg-emerald-600 text-white',
};

const PRIORITY_LABELS: Record<string, string> = {
  urgente: 'Urgente',
  atencao: 'Atenção',
  normal: 'Normal',
};

const PRIORITY_CLASS: Record<string, string> = {
  urgente: 'bg-red-600 text-white hover:bg-red-600',
  atencao: 'bg-yellow-500 text-black hover:bg-yellow-500',
  normal: 'bg-muted text-muted-foreground hover:bg-muted',
};

const PRIORITY_ORDER = ['urgente', 'atencao', 'normal'];

const ALL_VALUE = 'all';

export const AdminSupport: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>(ALL_VALUE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPriority, setNewPriority] = useState<string>('');
  const [note, setNote] = useState('');
  const [adminResponse, setAdminResponse] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-support-events', statusFilter],
    queryFn: async (): Promise<SupportEventRow[]> => {
      const { data, error } = await supabase.rpc('admin_list_support_events', {
        p_status: statusFilter === ALL_VALUE ? null : statusFilter,
        p_limit: 200,
        p_offset: 0,
      });
      if (error) throw error;
      return (data ?? []) as SupportEventRow[];
    },
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-support-event-detail', selectedId],
    queryFn: async (): Promise<SupportEventDetail> => {
      const { data, error } = await supabase.rpc('admin_get_support_event_detail', { p_event_id: selectedId });
      if (error) throw error;
      return data as unknown as SupportEventDetail;
    },
    enabled: !!selectedId,
  });

  const updateMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!selectedId || !status) return;
      const { error } = await supabase.rpc('admin_update_support_event_status', {
        p_event_id: selectedId,
        p_new_status: status,
        p_note: note.trim() || null,
        p_admin_response: adminResponse.trim() || null,
        p_priority: newPriority || null,
      });
      if (error) throw error;
      return status;
    },
    onSuccess: (status) => {
      toast({ title: status === 'concluido' ? 'Chamado marcado como concluído' : 'Chamado atualizado' });
      if (status) setNewStatus(status);
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['admin-support-events'] });
      queryClient.invalidateQueries({ queryKey: ['admin-support-event-detail', selectedId] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao atualizar chamado', description: err.message, variant: 'destructive' });
    },
  });

  const openDetail = (row: SupportEventRow) => {
    setSelectedId(row.id);
    setNewStatus(row.status);
    setNewPriority(row.priority);
    setAdminResponse(row.admin_response ?? '');
    setNote('');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-primary" />
            Suporte — chamados dos clientes
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos os status</SelectItem>
              {STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : error ? (
            <p className="text-destructive text-sm">Erro ao carregar chamados: {(error as Error).message}</p>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Urgência</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Atualizado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data ?? []).map((row) => (
                    <TableRow
                      key={row.id}
                      role="button"
                      tabIndex={0}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openDetail(row)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openDetail(row)}
                    >
                      <TableCell className="font-medium">#{row.event_number}</TableCell>
                      <TableCell className="max-w-[220px] truncate">{row.title}</TableCell>
                      <TableCell className="text-muted-foreground">{row.user_email}</TableCell>
                      <TableCell className="text-muted-foreground">{TYPE_LABELS[row.event_type] ?? row.event_type}</TableCell>
                      <TableCell>
                        <Badge className={PRIORITY_CLASS[row.priority]}>{PRIORITY_LABELS[row.priority] ?? row.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[row.status] ?? 'outline'} className={STATUS_CLASS[row.status]}>{STATUS_LABELS[row.status] ?? row.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(row.updated_at).toLocaleString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(data ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                        Nenhum chamado encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              <span>{detail ? `Chamado #${detail.event_number} · ${detail.title}` : 'Carregando...'}</span>
              {detail && (
                <Badge className={PRIORITY_CLASS[detail.priority]}>{PRIORITY_LABELS[detail.priority] ?? detail.priority}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {detailLoading || !detail ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                <p className="text-sm font-medium">{detail.user_email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                <p className="text-sm whitespace-pre-wrap">{detail.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Alterar status</p>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Alterar urgência</p>
                  <Select value={newPriority} onValueChange={setNewPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_ORDER.map((p) => (
                        <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Resposta visível pro cliente (opcional)</p>
                <Textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Ex: Corrigido no ar, obrigado por reportar!"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Nota interna (opcional, não aparece pro cliente)</p>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: causa raiz identificada em X"
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => updateMutation.mutate(newStatus)}
                  disabled={updateMutation.isPending || !newStatus}
                  className="flex-1"
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Salvar
                </Button>
                {detail.status === 'concluido' ? (
                  <Button
                    variant="outline"
                    onClick={() => updateMutation.mutate('em_analise')}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reabrir
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                    onClick={() => updateMutation.mutate('concluido')}
                    disabled={updateMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Marcar como concluído
                  </Button>
                )}
              </div>

              {detail.history.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Histórico</p>
                  <div className="space-y-2">
                    {detail.history.map((h, i) => (
                      <div key={i} className="text-xs text-muted-foreground border-l-2 border-border pl-2">
                        <p>
                          <span className="font-medium text-foreground">{STATUS_LABELS[h.new_status] ?? h.new_status}</span>
                          {' — '}{new Date(h.created_at).toLocaleString('pt-BR')}
                          {h.changed_by_email ? ` · ${h.changed_by_email}` : ''}
                        </p>
                        {h.note && <p className="italic">{h.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
