import React from 'react';
import { HelpCircle } from 'lucide-react';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';
import { HelpContent } from '@/components/help/HelpContent';
import { SEO } from '@/components/SEO';

const HelpCenter = () => {
  return (
    <ResponsiveLayout
      title="Central de Ajuda"
      subtitle="Encontre respostas e suporte para suas dúvidas"
      icon={HelpCircle}
    >
      <SEO
        title="Central de Ajuda - Plushify"
        description="Encontre respostas, tutoriais e suporte para usar o Plushify."
        path="/app/help"
      />
      <HelpContent />
    </ResponsiveLayout>
  );
};

export default HelpCenter;