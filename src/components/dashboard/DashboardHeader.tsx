
import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>
      {/* Mostra notificações em todas as telas, não apenas lg+ */}
      <div className="flex-shrink-0">
        <NotificationCenter />
      </div>
    </div>
  );
};
