import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

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
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-customer-detail', userId],
    queryFn: async (): Promise<CustomerDetail> => {
      const { data, error } = await supabase.rpc('admin_get_customer_detail', { p_user_id: userId });
      if (error) throw error;
      return data as unknown as CustomerDetail;
    },
    enabled: !!userId,
  });

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
