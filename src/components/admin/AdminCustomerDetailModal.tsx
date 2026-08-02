import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Clock, Ban, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PasswordDialog from '@/components/ui/password-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthorizationPassword } from '@/hooks/useAuthorizationPassword';

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
  abacate_checkout_id: string | null;
  abacate_subscription_id: string | null;
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
  deleted_email_before: string | null;
  deleted_at: string | null;
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

const REFUND_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const refundDaysLeft = (startedAt: string) => {
  const deadline = new Date(startedAt).getTime() + REFUND_WINDOW_MS;
  const msLeft = deadline - Date.now();
  return Math.ceil(msLeft / (24 * 60 * 60 * 1000));
};

const isWithinRefundWindow = (startedAt: string) => refundDaysLeft(startedAt) > 0;

const formatDateTime = (d: string | null) => (d ? new Date(d).toLocaleString('pt-BR') : '—');

interface Props {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

export const AdminCustomerDetailModal: React.FC<Props> = ({ userId, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { verifyPassword, isVerifying } = useAuthorizationPassword();
  const [extendDays, setExtendDays] = useState('7');
  const [extendReason, setExtendReason] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundTarget, setRefundTarget] = useState<SubscriptionEntry | null>(null);

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
    mutationFn: async (reason: string) => {
      const { error } = await supabase.rpc('admin_force_cancel_subscription', {
        p_user_id: userId,
        p_reason: reason,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Assinatura cancelada' });
      setCancelDialogOpen(false);
      invalidateAfterAction();
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao cancelar assinatura', description: err.message, variant: 'destructive' });
    },
  });

  const handleCancelConfirm = async (password: string, reason?: string) => {
    const isValid = await verifyPassword(password);
    if (!isValid) return;
    forceCancelMutation.mutate(reason ?? '');
  };

  const refundMutation = useMutation({
    mutationFn: async (reason: string) => {
      if (!refundTarget) return;
      const { data, error } = await supabase.functions.invoke('abacate-refund-checkout', {
        body: { target_user_id: userId, subscription_id: refundTarget.id, reason },
      });
      if (error) throw new Error(error.message ?? 'Erro ao comunicar com a AbacatePay');
      if (data?.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Reembolso realizado', description: 'O acesso pago desse cliente foi revogado.' });
      setRefundDialogOpen(false);
      setRefundTarget(null);
      invalidateAfterAction();
    },
    onError: (err: Error) => {
      toast({ title: 'Erro ao reembolsar', description: err.message, variant: 'destructive' });
    },
  });

  const handleRefundConfirm = async (password: string, reason?: string) => {
    const isValid = await verifyPassword(password);
    if (!isValid) return;
    refundMutation.mutate(reason ?? '');
  };

  const openRefundDialog = (sub: SubscriptionEntry) => {
    setRefundTarget(sub);
    setRefundDialogOpen(true);
  };

  const hasActiveTrial = data?.subscriptions.some((s) => s.status === 'trial_active');
  const hasActiveSubscription = data?.subscriptions.some((s) => s.status === 'active' || s.status === 'trial_active');

  return (
    <>
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
              {data.deleted_email_before && (
                <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3 space-y-1">
                  <h4 className="text-sm font-semibold text-destructive">Conta excluída pelo cliente</h4>
                  <p className="text-sm">
                    E-mail original: <span className="font-medium">{data.deleted_email_before}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Excluída em {data.deleted_at ? new Date(data.deleted_at).toLocaleString('pt-BR') : '—'} — use esse e-mail pra contatar o cliente.
                  </p>
                </div>
              )}

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

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <Ban className="w-3.5 h-3.5 mr-1.5" />
                    Cancelar assinatura
                  </Button>
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
                        {s.abacate_checkout_id && s.status !== 'refunded' && (
                          isWithinRefundWindow(s.started_at) ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                                onClick={() => openRefundDialog(s)}
                              >
                                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                                Reembolsar
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                Direito de arrependimento (Art. 49 CDC): {refundDaysLeft(s.started_at)} dia(s) restante(s)
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Prazo de reembolso (7 dias, Art. 49 CDC) expirado em {formatDateTime(new Date(new Date(s.started_at).getTime() + REFUND_WINDOW_MS).toISOString())}
                            </p>
                          )
                        )}
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

      <PasswordDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
        title={`Cancelar assinatura de ${data?.email ?? 'cliente'}?`}
        description="Isso encerra o acesso pago desse cliente imediatamente e fica registrado na auditoria. Não cancela nem estorna nada na AbacatePay — só encerra o acesso no nosso sistema. Digite o código do seu app autenticador e o motivo pra confirmar."
        isLoading={isVerifying || forceCancelMutation.isPending}
        requireReason={true}
      />

      <PasswordDialog
        open={refundDialogOpen}
        onOpenChange={(open) => { setRefundDialogOpen(open); if (!open) setRefundTarget(null); }}
        onConfirm={handleRefundConfirm}
        title={`Reembolsar ${data?.email ?? 'cliente'}?`}
        description="Estorna o valor dessa cobrança direto na AbacatePay (dinheiro volta pro cliente de verdade) e revoga o acesso pago na hora. Ação irreversível pelo sistema. Digite o código do seu app autenticador e o motivo pra confirmar."
        isLoading={isVerifying || refundMutation.isPending}
        requireReason={true}
      />
    </Dialog>
    </>
  );
};
