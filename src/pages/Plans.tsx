
import React from 'react';
import { PlansPage } from '@/components/plans/PlansPage';
import { SEO } from '@/components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Plans = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Planos e Preços - Plushify"
        description="Escolha o plano ideal para o seu negócio de estética. Compare recursos, preços e benefícios dos planos Plushify."
        path="/planos"
      />
      <Navbar />
      <main>
        <PlansPage />
      </main>
      <Footer />
    </div>
  );
};

export default Plans;
