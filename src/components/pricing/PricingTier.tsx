
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
      className={`rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-lg ${
        isPopular
          ? 'border-plush-400 shadow-lg shadow-plush-100/50 scale-105 relative lg:-mt-6'
          : 'border-muted bg-white hover:border-plush-200 hover:shadow-md'
      } ${isCurrentPlan ? 'ring-2 ring-plush-500 ring-opacity-50' : ''}`}
    >
      {isPopular && (
        <div className="bg-plush-600 text-white text-center py-1.5 text-sm font-medium">
          Mais Popular
        </div>
      )}
      
      {isCurrentPlan && (
        <div className="bg-green-600 text-white text-center py-1.5 text-sm font-medium">
          Seu Plano Atual
        </div>
      )}
      
      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-bold mb-2 font-serif">{title}</h3>
        <p className="text-foreground/70 text-sm mb-6">{description}</p>
        
        <div className="mb-6">
          <div className="flex items-end">
            <span className="text-3xl font-bold">{formattedPrice}</span>
            <span className="text-foreground/70 ml-2 mb-1">/mês</span>
          </div>
          {isYearly && price > 0 && (
            <p className="text-sm text-plush-600 mt-1">
              Economia de {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format((price * 12) - yearlyPrice * 12)} por ano
            </p>
          )}
          
          {isYearly && price > 0 ? (
            <p className="text-sm text-gray-600 mt-2">
              Total anual: {formattedAnnualTotal}
            </p>
          ) : price > 0 ? (
            <p className="text-sm text-gray-600 mt-2">
              Ou 10x de {formattedParcelValue}
            </p>
          ) : null}
        </div>
        
        <Button 
          className={`w-full transition-all duration-200 ${
            isPopular && !isCurrentPlan
              ? 'bg-plush-600 hover:bg-plush-700 text-white' 
              : isCurrentPlan
              ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
              : 'bg-white border border-plush-200 text-plush-600 hover:bg-plush-50'
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
              <div className={`min-w-5 h-5 rounded-full ${feature.included ? 'bg-plush-100' : 'bg-gray-100'} flex items-center justify-center mr-3 mt-0.5`}>
                {feature.included ? (
                  <Check className="w-3 h-3 text-plush-600" />
                ) : (
                  <X className="w-3 h-3 text-gray-400" />
                )}
              </div>
              <span className={`text-sm ${feature.included ? 'text-foreground/80' : 'text-foreground/50'}`}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
