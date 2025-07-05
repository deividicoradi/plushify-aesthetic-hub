
import React from 'react';
import { Rocket, TrendingUp, Shield, Star, Users, CheckCircle } from 'lucide-react';

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
          <span className="relative">
            de Estética
            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          Mais de{' '}
          <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
            10.000+ profissionais
          </span>{' '}
          já escolheram nossa plataforma. Sistema completo que{' '}
          <span className="font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
            aumenta vendas em até 200%
          </span>
          .
        </p>
      </div>

      {/* Benefits Badges */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center flex-wrap">
        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-700 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800 shadow-md hover:shadow-lg transition-shadow">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">Aumento médio de 150% no faturamento</span>
        </div>
        
        <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-shadow">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Garantia de 30 dias</span>
        </div>
      </div>

      {/* Social Proof */}
      <div className="flex flex-col sm:flex-row gap-6 items-center justify-center mt-8">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <img 
              src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" 
              alt="Usuário" 
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" 
              alt="Usuário" 
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face" 
              alt="Usuário" 
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face" 
              alt="Usuário" 
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
            />
            <img 
              src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=32&h=32&fit=crop&crop=face" 
              alt="Usuário" 
              className="w-8 h-8 rounded-full border-2 border-background object-cover"
            />
          </div>
          <span className="text-sm font-medium text-muted-foreground">+10.000 usuários</span>
        </div>
        
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="ml-2 text-sm font-medium text-muted-foreground">4.9/5 (2.847 avaliações)</span>
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
