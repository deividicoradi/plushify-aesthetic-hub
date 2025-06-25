
import React from 'react';

const AboutMission = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
          Nossa Proposta de Valor
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
          Nossa Missão
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed">
          Transformar a gestão de salões e clínicas através de tecnologia inteligente e acessível, 
          capacitando empreendedores a focar no que fazem de melhor: criar experiências excepcionais 
          para seus clientes e fazer seus negócios prosperarem.
        </p>
      </div>
    </section>
  );
};

export default AboutMission;
