import React from 'react';
import { HelpCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { SEO } from '@/components/SEO';
import { HelpContent } from '@/components/help/HelpContent';

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Central de Ajuda - Plushify"
        description="Encontre respostas, tutoriais e suporte para usar o Plushify."
        path="/help"
      />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Central de Ajuda</h1>
          </div>
          <p className="text-muted-foreground text-lg">Encontre respostas e suporte para suas dúvidas</p>
        </div>
        <HelpContent />
      </main>
      <Footer />
    </div>
  );
};

export default Help;
