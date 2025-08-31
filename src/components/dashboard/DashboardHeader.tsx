
import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { UserLimitDisplay } from '@/components/team/UserLimitDisplay';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { GlobalHeader } from '@/components/layout/GlobalHeader';

export const DashboardHeader = () => {
  const { hasFeature } = usePlanLimits();
  const showTeamManagement = hasFeature('hasTeamManagement');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <GlobalHeader />
      </div>
      
      {/* Exibir limitação de usuários se gestão de equipe estiver disponível */}
      {showTeamManagement && (
        <UserLimitDisplay variant="minimal" showUpgradeButton={false} />
      )}
    </div>
  );
};
