import React from 'react';
import { WhatsAppMonitoringDashboard } from '@/components/whatsapp/WhatsAppMonitoringDashboard';
import { WhatsAppMetricsCollector } from '@/components/whatsapp/WhatsAppMetricsCollector';
import { useAuth } from '@/contexts/AuthContext';

export const MonitoringDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-6">
      {/* Coletor de métricas em background */}
      <WhatsAppMetricsCollector 
        userId={user?.id} 
        sessionId="monitoring-dashboard" 
      />
      
      {/* Dashboard principal */}
      <WhatsAppMonitoringDashboard />
    </div>
  );
};