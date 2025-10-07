
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PlansPage } from '@/components/plans/PlansPage';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { Sparkles } from 'lucide-react';

const Plans = () => {
  const { user } = useAuth();

  // Se o usuário estiver logado, mostrar com ResponsiveLayout
  if (user) {
    return (
      <ResponsiveLayout
        title="Planos"
        subtitle="Escolha o plano ideal para o seu negócio"
        icon={Sparkles}
      >
        <PlansPage />
      </ResponsiveLayout>
    );
  }

  // Se não estiver logado, mostrar layout público
  return <PlansPage />;
};

export default Plans;
