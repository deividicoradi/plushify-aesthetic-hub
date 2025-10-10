
import React from 'react';
import { PlanCard } from './PlanCard';
import { PlanFeature } from '@/utils/plans/plansData';

interface PlansGridProps {
  plans: PlanFeature[];
  isAnnual: boolean;
  onPlanSelection: (planId: string) => void;
  isLoading: (planKey: string) => boolean;
}

export const PlansGrid: React.FC<PlansGridProps> = ({
  plans,
  isAnnual,
  onPlanSelection,
  isLoading
}) => {
  // Filtrar Trial quando estiver na aba Anual
  const filteredPlans = isAnnual 
    ? plans.filter(plan => plan.id !== 'trial')
    : plans;

  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 rounded-3xl -z-10"></div>
      
      {/* Section header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Escolha o Plano Ideal
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Todos os planos incluem suporte técnico, atualizações automáticas e segurança avançada
        </p>
      </div>

      {/* Plans grid with staggered animation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
        {filteredPlans.map((plan, index) => (
          <div
            key={plan.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <PlanCard
              plan={plan}
              isAnnual={isAnnual}
              onPlanSelection={onPlanSelection}
              isLoading={isLoading}
            />
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12 p-8 bg-gradient-to-r from-muted/50 to-muted/30 rounded-2xl border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Não encontrou o que procura?
        </h3>
        <p className="text-muted-foreground mb-4">
          Entre em contato para planos corporativos personalizados
        </p>
        <button 
          onClick={() => {
            const whatsappMessage = encodeURIComponent("Olá! Gostaria de saber mais sobre planos corporativos personalizados do Plushify.");
            window.open(`https://wa.me/5549999150421?text=${whatsappMessage}`, '_blank');
          }}
          className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
        >
          Falar com Especialista
        </button>
      </div>
    </div>
  );
};
