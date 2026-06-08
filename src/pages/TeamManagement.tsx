import React from 'react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { FeatureGuard } from '@/components/FeatureGuard';
import { TeamManagement as TeamManagementComponent } from '@/components/premium/TeamManagement';
import { Users, AlertCircle } from 'lucide-react';

const TeamManagement = () => {
  return (
    <ResponsiveLayout
      title="Gestão de Equipe"
      subtitle="Gerencie membros da sua equipe"
      icon={Users}
    >
      <FeatureGuard 
        planFeature="hasTeamManagement"
        fallback={
          <div className="text-center py-8 sm:py-12">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2">
              Gestão de Equipe
            </h2>
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade está disponível apenas para assinantes Premium.
            </p>
          </div>
        }
      >
        <TeamManagementComponent />
      </FeatureGuard>
    </ResponsiveLayout>
  );
};

export default TeamManagement;