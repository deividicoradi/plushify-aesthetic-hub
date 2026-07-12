import React from 'react';
import { Crown } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { PlansPage } from '@/components/plans/PlansPage';
import { SEO } from '@/components/SEO';

const PlansInternal = () => {
  return (
    <ResponsiveLayout
      title="Planos"
      subtitle="Gerencie sua assinatura e explore os planos disponíveis"
      icon={Crown}
    >
      <SEO
        title="Planos - Plushify"
        description="Gerencie sua assinatura Plushify."
        path="/app/planos"
      />
      <PlansPage />
    </ResponsiveLayout>
  );
};

export default PlansInternal;
