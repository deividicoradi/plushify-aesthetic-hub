
import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  onPlanSelection: (planId: string) => void;
  isLoading: (planKey: string) => boolean;
  isAnnual: boolean;
}

export const CTASection: React.FC<CTASectionProps> = ({
  onPlanSelection,
  isLoading,
  isAnnual
}) => {
  return (
    <Card className="text-center bg-primary text-primary-foreground">
      <CardContent className="p-10 space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <Crown className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold">
            Pronto para revolucionar seu negócio?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Junte-se aos milhares de profissionais que já transformaram seus negócios com nossa plataforma. 
            <span className="font-semibold">O sucesso está a um clique de distância!</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={() => onPlanSelection('premium')}
            disabled={isLoading('premium_' + (isAnnual ? 'annual' : 'monthly'))}
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold text-lg px-6 py-3 shadow-lg transform hover:scale-105 transition-all h-14"
          >
            <div className="flex items-center justify-center gap-3">
              <Crown className="w-6 h-6 flex-shrink-0" />
              <span>{isLoading('premium_' + (isAnnual ? 'annual' : 'monthly')) ? "Processando..." : "Começar com Enterprise"}</span>
              {!isLoading('premium_' + (isAnnual ? 'annual' : 'monthly')) && <ArrowRight className="w-5 h-5 flex-shrink-0" />}
            </div>
          </Button>
          <div className="text-sm opacity-75">
            Sem compromisso • Cancele quando quiser • Suporte 24/7
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
