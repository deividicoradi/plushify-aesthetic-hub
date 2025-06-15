
import React from 'react';
import { Rocket, TrendingUp, Shield } from 'lucide-react';

export const PlansHero: React.FC = () => {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium">
        <Rocket className="w-4 h-4" />
        Oferta Limitada - Apenas este mês!
      </div>
      <h1 className="text-4xl font-bold max-w-4xl mx-auto leading-tight">
        Transforme Seu Negócio de <span className="text-primary">Estética</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
        Mais de <span className="text-primary font-semibold">10.000+ profissionais</span> já escolheram nossa plataforma. 
        Sistema completo que <span className="text-green-600 font-semibold">aumenta vendas em até 200%</span>.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">Aumento médio de 150% no faturamento</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-full border">
          <Shield className="w-4 h-4" />
          <span className="font-medium">Garantia de 30 dias</span>
        </div>
      </div>
    </div>
  );
};
