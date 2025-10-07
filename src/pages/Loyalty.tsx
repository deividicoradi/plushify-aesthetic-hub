
import React from "react";
import { Sparkles } from "lucide-react";
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { useLoyalty } from "@/hooks/useLoyalty";
import { LoyaltyStatsCards } from "@/components/loyalty/LoyaltyStatsCards";
import { TopClientsCard } from "@/components/loyalty/TopClientsCard";
import { LoyaltyRulesCard } from "@/components/loyalty/LoyaltyRulesCard";
import { ChallengesCard } from "@/components/loyalty/ChallengesCard";
import { RewardsCard } from "@/components/loyalty/RewardsCard";
import { LoyaltyClientsTable } from "@/components/loyalty/LoyaltyClientsTable";

export default function Loyalty() {
  const { clients, stats, loading } = useLoyalty();

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
      <div className="space-y-6">
        {/* Stats Cards */}
        <LoyaltyStatsCards stats={stats} />

        {/* Top Clients and Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopClientsCard clients={clients} />
          </div>
          <LoyaltyRulesCard />
        </div>

        {/* Challenges and Rewards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChallengesCard />
          <RewardsCard />
        </div>

        {/* All Clients Table */}
        <LoyaltyClientsTable clients={clients} />
      </div>
    </ResponsiveLayout>
  );
}
