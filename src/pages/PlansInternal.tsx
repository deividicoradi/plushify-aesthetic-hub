import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Crown } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { PlansPage } from '@/components/plans/PlansPage';
import { SEO } from '@/components/SEO';

const PlansInternal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message = (location.state as { message?: string } | null)?.message;
  const [banner, setBanner] = useState<string | null>(message ?? null);

  useEffect(() => {
    if (message) {
      toast.info(message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [message, navigate, location.pathname]);

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
      {banner && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground flex items-start justify-between gap-4"
        >
          <span>{banner}</span>
          <button
            onClick={() => setBanner(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Fechar mensagem"
          >
            ×
          </button>
        </div>
      )}
      <PlansPage />
    </ResponsiveLayout>
  );
};

export default PlansInternal;
