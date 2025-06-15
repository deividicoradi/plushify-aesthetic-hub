
import React from "react";
import { Star, Sparkles } from "lucide-react";
import DashboardSidebar from '@/components/layout/DashboardSidebar';
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
      <div className="min-h-screen bg-background">
        <DashboardSidebar />
        <main className="ml-64 min-h-screen">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <main className="ml-64 min-h-screen">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎮 Sistema de Fidelidade Gamificado
                </h1>
                <p className="text-muted-foreground">Transforme seus clientes em verdadeiros fãs com pontos, desafios e recompensas!</p>
              </div>
            </div>
          </div>

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
      </main>
    </div>
  );
}
