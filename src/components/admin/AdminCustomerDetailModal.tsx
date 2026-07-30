import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Clock, Ban } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionEntry {
  id: string;
  plan_type: string;
  status: string;
  billing_interval: string | null;
  payment_kind: string | null;
  plan_amount_paid: number | null;
  started_at: string;
  expires_at: string | null;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
  updated_at: string;
}

interface UpgradeEntry {
  id: string;
  previous_plan_type: string;
  previous_billing_interval: string | null;
  new_plan_type: string;
  new_billing_interval: string;
  credit_cents: number;
  new_price_cents: number;
  charge_now_cents: number;
  accepted_at: string;
}

interface CustomerDetail {
  user_id: string;
  email: string;
  signed_up_at: string;
  subscriptions: SubscriptionEntry[];
  upgrades: UpgradeEntry[];
}

const PLAN_LABELS: Record<string, string> = {
  trial: 'Trial',
  professional: 'Profissional',
  premium: 'Premium',
};

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  trial_active: 'default',
  cancelled: 'secondary',
  canceled: 'secondary',
  refunded: 'destructive',
  disputed: 'destructive',
};

const formatBRL = (cents: number | null) =>
  cents == null ? '—' : (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDateTime = (d: string | null) => (d ? new Date(d).toLocaleString('pt-BR') : '—');

interface Props {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

export const AdminCustomerDetailModal: React.FC<Props> = ({ userId, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [extendDays, setExtendDays] = useState('7');
  const [extendReason, setExtendReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customer-detail', userId],
    queryFn: async (): Promise<CustomerDetail> => {
      const { data, error } = await supabase.rpc('admin_get_customer_detail', { p_user_id: userId });
      if (error) throw error;
      return data as unknown as CustomerDetail;
    },
    enabled: !!userId,
  });

  const invalidateAfterAction = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-customer-detail', userId] });
    queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    queryClient.invalidateQueries({ queryKey: ['admin-overview-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-overview-details'] });
    queryClient.invalidateQueries({ queryKey: ['admin-actions-log'] });
  };

  const extendTrialMutation = useMutation({
    mutationFn: async () => {
      const days = parseInt(extendDays, 10);
      const { error } = await supabase.rpc('admin_extend_trial', {
        p_user_id: userId,
        p_days: days,
        p_reason: extendReason || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Trial estendido com sucesso' });
      setExtendReason('');
      invalidateAfterAction();
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao estender trial', description: err.message, variant: 'destructive' });
    },
  });

  const forceCancelMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('admin_force_cancel_subscription', {
        p_user_id: userId,
        p_reason: cancelReason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Assinatura cancelada' });
      setCancelReason('');
      invalidateAfterAction();
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao cancelar assinatura', description: err.message, variant: 'destructive' });
    },
  });

  const hasActiveTrial = data?.subscriptions.some((s) => s.status === 'trial_active');
  const hasActiveSubscription = data?.subscriptions.some((s) => s.status === 'active' || s.status === 'trial_active');

  return (
    <Dialog open={!!userId} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{data?.email ?? 'Detalhe do cliente'}</DialogTitle>
          {data && (
            <DialogDescription>
              Cadastrado em {new Date(data.signed_up_at).toLocaleDateString('pt-BR')}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading && <div className="py-10 text-center text-sm text-muted-foreground">Carregando...</div>}
        {!!error && (
          <p className="text-destructive text-sm">Erro ao carregar cliente: {(error as Error).message}</p>
        )}

        {data && (
          <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-6 py-2">
              {hasActiveSubscription && (
                <div className="rounded-md border border-border p-3 space-y-3">
                  <h4 className="text-sm font-semibold">Ações administrativas</h4>

                  {hasActiveTrial && (
                    <div className="flex flex-wrap items-end gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Estender trial (dias)</label>
                        <Input
                          type="number"
                          min={1}
                          max={90}
                          value={extendDays}
                          onChange={(e) => setExtendDays(e.target.value)}
                          className="w-24 h-8"
                        />
                      </div>
                      <div className="flex-1 min-w-[160px] space-y-1">
                        <label className="text-xs text-muted-foreground">Motivo (opcional)</label>
                        <Input
                          value={extendReason}
                          onChange={(e) => setExtendReason(e.target.value)}
                          placeholder="Ex: cortesia, teste"
                          className="h-8"
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={extendTrialMutation.isPending}
                        onClick={() => extendTrialMutation.mutate()}
                      >
                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                        Estender
                      </Button>
                    </div>
                  )}

                  <AlertDialog>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Motivo do cancelamento (obrigatório)</label>
                      <Textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Ex: solicitação do cliente via suporte, fraude, etc."
                        className="text-sm min-h-[60px]"
                      />
                    </div>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={forceCancelMutation.isPending || !cancelReason.trim()}
                      >
                        <Ban className="w-3.5 h-3.5 mr-1.5" />
                        Cancelar assinatura
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar assinatura de {data.email}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso encerra o acesso pago desse cliente imediatamente. Essa ação fica registrada na
                          auditoria com seu usuário e o motivo informado. Não cancela nem estorna nada na AbacatePay
                          — só encerra o acesso no nosso sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => forceCancelMutation.mutate()}>
                          Confirmar cancelamento
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              <div>
                <h4 className="text-sm font-semibold mb-2">Histórico de assinaturas</h4>
                {data.subscriptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma assinatura registrada.</p>
                ) : (
                  <div className="space-y-2">
                    {data.subscriptions.map((s) => (
                      <div key={s.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {PLAN_LABELS[s.plan_type] ?? s.plan_type}
                            {s.billing_interval ? ` · ${s.billing_interval === 'year' ? 'Anual' : 'Mensal'}` : ''}
                          </span>
                          <Badge variant={STATUS_VARIANT[s.status] ?? 'outline'}>{s.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                          <span>Início: {formatDateTime(s.started_at)}</span>
                          <span>Expira: {formatDateTime(s.expires_at)}</span>
                          {s.trial_ends_at && <span>Trial até: {formatDateTime(s.trial_ends_at)}</span>}
                          <span>Valor: {formatBRL(s.plan_amount_paid)}</span>
                          {s.payment_kind && <span>Método: {s.payment_kind}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Upgrades com crédito aplicado</h4>
                {data.upgrades.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum upgrade registrado.</p>
                ) : (
                  <div className="space-y-2">
                    {data.upgrades.map((u) => (
                      <div key={u.id} className="rounded-md border border-border p-3 text-sm space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span>{PLAN_LABELS[u.previous_plan_type] ?? u.previous_plan_type}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="font-medium">{PLAN_LABELS[u.new_plan_type] ?? u.new_plan_type}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                          <span>Aceito em: {formatDateTime(u.accepted_at)}</span>
                          <span className="text-emerald-600">Crédito: −{formatBRL(u.credit_cents)}</span>
                          <span>Cobrado: {formatBRL(u.charge_now_cents)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
