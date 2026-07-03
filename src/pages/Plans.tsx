
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlansPage } from '@/components/plans/PlansPage';
import { SEO } from '@/components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Plans = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const message = (location.state as { message?: string } | null)?.message;
  const [banner, setBanner] = useState<string | null>(message ?? null);

  useEffect(() => {
    if (message) {
      toast.info(message);
      // limpa o state para não repetir ao navegar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [message, navigate, location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Planos e Preços - Plushify"
        description="Escolha o plano ideal para o seu negócio de estética. Compare recursos, preços e benefícios dos planos Plushify."
        path="/planos"
      />
      <Navbar />
      <main>
        {banner && (
          <div className="container mx-auto px-4 pt-6">
            <div
              role="alert"
              className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground flex items-start justify-between gap-4"
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
          </div>
        )}
        <PlansPage />
      </main>
      <Footer />
    </div>
  );
};

export default Plans;
