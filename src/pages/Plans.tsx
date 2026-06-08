
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlansPage } from '@/components/plans/PlansPage';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { SEO } from '@/components/SEO';
import { Sparkles } from 'lucide-react';

const Plans = () => {
  const { user } = useAuth();

  const seo = (
    <SEO
      title="Planos e Preços - Plushify"
      description="Escolha o plano ideal para o seu negócio de estética. Compare recursos, preços e benefícios dos planos Plushify."
      path="/planos"
    />
  );

  // Se o usuário estiver logado, mostrar com ResponsiveLayout
  if (user) {
    return (
      <ResponsiveLayout
        title="Planos"
        subtitle="Escolha o plano ideal para o seu negócio"
        icon={Sparkles}
      >
        {seo}
        <PlansPage />
      </ResponsiveLayout>
    );
  }

  // Se não estiver logado, mostrar layout público
  return (<>{seo}<PlansPage /></>);
};

export default Plans;
