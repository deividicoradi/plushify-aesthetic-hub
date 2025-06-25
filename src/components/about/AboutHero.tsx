
import React from 'react';
import { Sparkles, Globe, Shield, Clock } from 'lucide-react';

const AboutHero = () => {
  return (
    <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent2-500/10 rounded-full blur-3xl opacity-20"></div>
      
      <div className="relative max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Conheça nossa história
        </div>
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
          Sobre o Plushify
        </h1>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
          Somos a plataforma líder em gestão digital para salões de beleza e clínicas de estética no Brasil. 
          Nossa missão é capacitar empreendedores do setor a alcançarem novos patamares de sucesso através da tecnologia.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span>Orgulhosamente Brasileiro</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>LGPD Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Suporte Especializado</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
