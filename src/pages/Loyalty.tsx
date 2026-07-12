
import React, { useEffect, useState } from "react";
import { Sparkles, Settings } from "lucide-react";
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { useLoyalty } from "@/hooks/useLoyalty";
import { LoyaltyStatsCards } from "@/components/loyalty/LoyaltyStatsCards";
import { TopClientsCard } from "@/components/loyalty/TopClientsCard";
import { LoyaltyRulesCard } from "@/components/loyalty/LoyaltyRulesCard";
import { ChallengesCard } from "@/components/loyalty/ChallengesCard";
import { RewardsCard } from "@/components/loyalty/RewardsCard";
import { LoyaltyClientsTable } from "@/components/loyalty/LoyaltyClientsTable";
import { LoyaltyConfigDialog } from "@/components/loyalty/LoyaltyConfigDialog";
import { LoyaltyDetailsModal } from "@/components/loyalty/LoyaltyDetailsModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { LoyaltyMetric } from "@/hooks/loyalty/useLoyaltyDetails";

const sb: any = supabase;

export default function Loyalty() {
  const { clients, stats, loading } = useLoyalty();
  const { user } = useAuth();
  const [configOpen, setConfigOpen] = useState(false);
  const [metric, setMetric] = useState<LoyaltyMetric | null>(null);
  const [aggregates, setAggregates] = useState({
    activeChallenges: 0, redemptionsCount: 0, redemptionsValue: 0, pointsCirculating: 0,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      await sb.rpc('ensure_loyalty_defaults');
      const [ch, red, tx] = await Promise.all([
        sb.from('loyalty_challenges').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
        sb.from('loyalty_reward_redemptions').select('estimated_value').eq('user_id', user.id),
        sb.from('loyalty_point_transactions').select('points, kind').eq('user_id', user.id),
      ]);
      const redRows = red.data ?? [];
      const txRows = tx.data ?? [];
      setAggregates({
        activeChallenges: ch.count ?? 0,
        redemptionsCount: redRows.length,
        redemptionsValue: redRows.reduce((s: number, r: any) => s + (Number(r.estimated_value) || 0), 0),
        pointsCirculating: txRows.reduce((s: number, r: any) => s + (r.kind === 'spend' ? -1 : 1) * (Number(r.points) || 0), 0),
      });
    })();
  }, [user, configOpen, metric]);

  if (loading) {
    return (
      <ResponsiveLayout
        title="Sistema de Fidelidade"
        subtitle="Transforme seus clientes em verdadeiros fãs com pontos, desafios e recompensas"
        icon={Sparkles}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout
      title="Sistema de Fidelidade"
      subtitle="Transforme seus clientes em verdadeiros fãs com pontos, desafios e recompensas"
      icon={Sparkles}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />Configurar Fidelidade
          </Button>
        </div>

        <LoyaltyStatsCards
          stats={stats}
          vipCount={clients.length}
          challengesCount={aggregates.activeChallenges}
          redemptionsCount={aggregates.redemptionsCount}
          redemptionsValue={aggregates.redemptionsValue}
          pointsCirculating={aggregates.pointsCirculating || stats.pointsDistributed}
          onCardClick={(m) => setMetric(m)}
        />

        {/* Top Clients and Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <div className="lg:col-span-2">
            <TopClientsCard clients={clients} />
          </div>
          <LoyaltyRulesCard />
        </div>

        {/* Challenges and Rewards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <ChallengesCard />
          <RewardsCard />
        </div>

        {/* All Clients Table */}
        <LoyaltyClientsTable clients={clients} />
      </div>

      <LoyaltyConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
      <LoyaltyDetailsModal open={!!metric} onOpenChange={(o) => !o && setMetric(null)} metric={metric} />
    </ResponsiveLayout>
  );
}
