
import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PricingTierProps = {
  tier: string;
  isPopular?: boolean;
  isYearly: boolean;
  title: string;
  price: number;
  yearlyPrice: number;
  parcelValue: number;
  description: string;
  features: { included: boolean; text: string }[];
  buttonText: string;
  isLoading?: boolean;
  isCurrentPlan?: boolean;
  onSubscribe: () => void;
};

export const PricingTier = ({
  tier,
  isPopular,
  isYearly,
  title,
  price,
  yearlyPrice,
  parcelValue,
  description,
  features,
  buttonText,
  isLoading,
  isCurrentPlan,
  onSubscribe,
}: PricingTierProps) => {
  const displayPrice = isYearly ? yearlyPrice : price;
  const annualTotal = isYearly ? yearlyPrice * 12 : 0;
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(displayPrice);
  
  const formattedAnnualTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(annualTotal);

  const formattedParcelValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(parcelValue);

  const getButtonText = () => {
    if (isLoading) return 'Processando...';
    if (isCurrentPlan) return 'Plano Atual';
    return buttonText;
  };

  const getButtonVariant = () => {
    if (isCurrentPlan) return 'outline';
    return isPopular ? 'default' : 'outline';
  };

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg bg-card ${
        isPopular
          ? 'border-primary shadow-lg shadow-primary/20 scale-105 relative lg:-mt-6'
          : 'border-border hover:border-primary/30 hover:shadow-md'
      } ${isCurrentPlan ? 'ring-2 ring-primary/50' : ''}`}
    >
      {isPopular && (
        <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-medium">
          Mais Popular
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="bg-green-600 text-white text-center py-1.5 text-sm font-medium">
          Seu Plano Atual
        </div>
      )}
      
      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-bold mb-2 font-serif text-card-foreground">{title}</h3>
        <p className="text-muted-foreground text-sm mb-6">{description}</p>
        
        <div className="mb-6">
          <div className="flex items-end">
            <span className="text-3xl font-bold text-card-foreground">{formattedPrice}</span>
            <span className="text-muted-foreground ml-2 mb-1">/mês</span>
          </div>
          {isYearly && price > 0 && (
            <p className="text-sm text-primary mt-1">
              Economia de {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format((price * 12) - yearlyPrice * 12)} por ano
            </p>
          )}
          
          {isYearly && price > 0 ? (
            <p className="text-sm text-muted-foreground mt-2">
              Total anual: {formattedAnnualTotal}
            </p>
          ) : price > 0 ? (
            <p className="text-sm text-muted-foreground mt-2">
              Ou 10x de {formattedParcelValue}
            </p>
          ) : null}
        </div>
        
        <Button 
          className={`w-full transition-all duration-200 ${
            isPopular && !isCurrentPlan
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
              : isCurrentPlan
              ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-800'
              : 'bg-card border-border text-card-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          variant={getButtonVariant()}
          onClick={onSubscribe}
          disabled={isLoading || isCurrentPlan}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {getButtonText()}
        </Button>
        
        <div className="mt-8 space-y-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className={`min-w-5 h-5 rounded-full ${feature.included ? 'bg-primary/10' : 'bg-muted'} flex items-center justify-center mr-3 mt-0.5`}>
                {feature.included ? (
                  <Check className="w-3 h-3 text-primary" />
                ) : (
                  <X className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
              <span className={`text-sm ${feature.included ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
