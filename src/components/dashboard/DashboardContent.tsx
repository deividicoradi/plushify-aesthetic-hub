
import React from 'react';
import { InteractiveChart } from '@/components/dashboard/InteractiveChart';
import { ModernActivityFeed } from '@/components/dashboard/ModernActivityFeed';
import { FloatingActionButtons } from '@/components/dashboard/FloatingActionButtons';
import { WeeklyOverview } from '@/components/dashboard/WeeklyOverview';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { QuickHelp } from '@/components/dashboard/QuickHelp';
import { TeamManagement } from '@/components/premium/TeamManagement';
import { useSubscription } from '@/hooks/useSubscription';

export const DashboardContent = () => {
  const { hasFeature } = useSubscription();

  return (
    <div className="space-y-8 p-1 relative">
      {/* Interactive Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <InteractiveChart />
        </div>
        <div className="space-y-6">
          <WeeklyOverview />
        </div>
      </div>

      {/* Activity and Alerts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <ModernActivityFeed />
        <div className="space-y-6">
          <AlertsPanel />
          <QuickHelp />
        </div>
      </div>

      {/* Premium Features Section */}
      {hasFeature('premium') && (
        <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800/30">
          {/* Background pattern */}
          <div className="absolute inset-0 bg-grid-purple-500/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">✨</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Recursos Premium
                </h2>
                <p className="text-purple-700 dark:text-purple-300">
                  Funcionalidades avançadas para o seu negócio
                </p>
              </div>
            </div>
            <TeamManagement />
          </div>
        </div>
      )}

      {/* Floating Action Buttons */}
      <FloatingActionButtons />
    </div>
  );
};
