
import React from "react";
import { Star } from "lucide-react";
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { useLoyalty } from "@/hooks/useLoyalty";
import { LoyaltyStatsCards } from "@/components/loyalty/LoyaltyStatsCards";
import { TopClientsCard } from "@/components/loyalty/TopClientsCard";
import { LoyaltyRulesCard } from "@/components/loyalty/LoyaltyRulesCard";
import { LoyaltyClientsTable } from "@/components/loyalty/LoyaltyClientsTable";

export default function Loyalty() {
  const { clients, stats, loading } = useLoyalty();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full">
        <DashboardSidebar />
        <div className="flex-1">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Programa de Fidelidade</h1>
                <p className="text-muted-foreground">Gerencie pontos e recompensas dos seus clientes</p>
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

          {/* All Clients Table */}
          <LoyaltyClientsTable clients={clients} />
        </div>
      </div>
    </div>
  );
}
