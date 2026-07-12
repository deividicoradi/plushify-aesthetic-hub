import React from 'react';
import { DetailsListModal, DetailsSection } from '@/components/common/DetailsListModal';
import { useLoyaltyDetails, LoyaltyMetric } from '@/hooks/loyalty/useLoyaltyDetails';
import { Badge } from '@/components/ui/badge';

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n || 0);
const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metric: LoyaltyMetric | null;
}

export const LoyaltyDetailsModal: React.FC<Props> = ({ open, onOpenChange, metric }) => {
  const { loading, rows, clientsMap, rewardsMap } = useLoyaltyDetails(metric, open);

  const config: Record<LoyaltyMetric, {
    title: string; totalLabel: string; total: string;
    section: DetailsSection<any>;
  }> = {
    vip: {
      title: 'Clientes VIP',
      totalLabel: 'Clientes ativos',
      total: String(rows.length),
      section: {
        key: 'vip', title: 'Clientes', items: rows,
        getDate: (r) => r.last,
        render: (r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="font-medium truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.appointments} agend. · última {fmtDate(r.last)}</p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <Badge variant="outline" className="mb-1">{r.tier}</Badge>
              <p className="text-xs">{r.points} pts · {fmtBRL(r.spent)}</p>
            </div>
          </div>
        ),
      },
    },
    challenges: {
      title: 'Desafios Ativos',
      totalLabel: 'Ativos',
      total: String(rows.filter((r: any) => r.status === 'active').length),
      section: {
        key: 'challenges', title: 'Desafios', items: rows,
        getDate: (r) => r.created_at,
        render: (r) => (
          <div key={r.id} className="rounded-md border px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{r.title}</p>
              <Badge variant={r.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{r.status}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1">
              <span>Tipo: {r.goal_type}</span>
              <span>Meta: {r.target_value}</span>
              <span>Dificuldade: {r.difficulty}</span>
              <span>Público: {r.audience}</span>
              {r.reward && <span>Recompensa: {r.reward}</span>}
            </div>
          </div>
        ),
      },
    },
    redemptions: {
      title: 'Recompensas Distribuídas',
      totalLabel: 'Valor estimado',
      total: fmtBRL(rows.reduce((s: number, r: any) => s + (Number(r.estimated_value) || 0), 0)),
      section: {
        key: 'redemptions', title: 'Resgates', items: rows,
        getDate: (r) => r.redeemed_at,
        render: (r) => (
          <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="font-medium truncate">{r.reward_title || rewardsMap[r.reward_id] || 'Recompensa'}</p>
              <p className="text-xs text-muted-foreground">
                {clientsMap[r.client_id] || '—'} · {fmtDate(r.redeemed_at)}
              </p>
            </div>
            <div className="text-right shrink-0 ml-2">
              <p className="text-xs">{r.points_used} pts</p>
              <p className="text-xs text-muted-foreground">{fmtBRL(Number(r.estimated_value) || 0)}</p>
              <Badge variant="outline" className="text-[10px] mt-1">{r.status}</Badge>
            </div>
          </div>
        ),
      },
    },
    points: {
      title: 'Pontos Circulando',
      totalLabel: 'Saldo total',
      total: String(rows.reduce((s: number, r: any) => s + (r.kind === 'spend' ? -1 : 1) * (Number(r.points) || 0), 0)),
      section: {
        key: 'points', title: 'Movimentações', items: rows,
        getDate: (r) => r.created_at,
        render: (r) => {
          const sign = r.kind === 'spend' ? '-' : '+';
          return (
            <div key={r.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="font-medium truncate">{clientsMap[r.client_id] || '—'}</p>
                <p className="text-xs text-muted-foreground truncate">{r.description || r.source}</p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className={`text-sm font-semibold ${r.kind === 'spend' ? 'text-red-500' : 'text-green-600'}`}>
                  {sign}{r.points} pts
                </p>
                <p className="text-[11px] text-muted-foreground">{fmtDate(r.created_at)}</p>
              </div>
            </div>
          );
        },
      },
    },
  };

  if (!metric) return null;
  const c = config[metric];

  return (
    <DetailsListModal
      open={open}
      onOpenChange={onOpenChange}
      title={c.title}
      loading={loading}
      headerTotal={c.total}
      headerTotalLabel={c.totalLabel}
      headerCount={rows.length}
      sections={[c.section]}
      emptyLabel="Nenhum registro ainda."
    />
  );
};