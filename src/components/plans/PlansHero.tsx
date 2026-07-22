
import React from 'react';
import { Rocket, TrendingUp, Shield, CheckCircle } from 'lucide-react';

export const PlansHero: React.FC = () => {
  return (
    <div className="text-center space-y-8 animate-fade-in">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 text-primary rounded-full text-sm font-medium shadow-lg backdrop-blur-sm hover:scale-105 transition-transform duration-300">
        <Rocket className="w-4 h-4" />
        <span>🔥 Oferta Limitada - Apenas este mês!</span>
      </div>

      {/* Main Title */}
      <div className="space-y-4">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold max-w-5xl mx-auto leading-tight bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent">
          Transforme Seu Negócio{' '}
          <br />
          <span className="relative inline-block">
            de Estética
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Sistema completo de gestão para o seu negócio de estética.
          Agenda, financeiro e clientes em um só lugar.
        </p>
      </div>

      {/* Benefits Badges */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-wrap">
        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-shadow">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">Simples de usar, sem curva de aprendizado</span>
        </div>
        
        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-shadow">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Garantia de 30 dias</span>
        </div>
      </div>

      {/* Key Features Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium">Agendamento Automático</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium">Gestão Financeira Completa</span>
        </div>
        <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          <span className="text-sm font-medium">Relatórios Inteligentes</span>
        </div>
      </div>
    </div>
  );
};
