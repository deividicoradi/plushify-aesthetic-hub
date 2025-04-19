
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingTier = ({
  tier,
  isPopular,
  isYearly,
  title,
  price,
  yearlyPrice,
  description,
  features,
  buttonText,
}: {
  tier: string;
  isPopular?: boolean;
  isYearly: boolean;
  title: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: { included: boolean; text: string }[];
  buttonText: string;
}) => {
  const displayPrice = isYearly ? yearlyPrice : price;
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(displayPrice);

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-all duration-300 ${
        isPopular
          ? 'border-plush-400 shadow-lg shadow-plush-100/50 scale-105 relative lg:-mt-6'
          : 'border-muted bg-white hover:border-plush-200 hover:shadow-md'
      }`}
    >
      {isPopular && (
        <div className="bg-plush-600 text-white text-center py-1.5 text-sm font-medium">
          Mais Popular
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
          {isYearly && (
            <p className="text-sm text-plush-600 mt-1">
              Economia de {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format((price * 12) - yearlyPrice * 12)} por ano
            </p>
          )}
        </div>
        
        <Button 
          className={`w-full ${
            isPopular 
              ? 'bg-plush-600 hover:bg-plush-700 text-white' 
              : 'bg-white border border-plush-200 text-plush-600 hover:bg-plush-50'
          }`}
          variant={isPopular ? 'default' : 'outline'}
        >
          {buttonText}
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

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  
  const pricingPlans = [
    {
      tier: 'free',
      title: 'Free',
      price: 0,
      yearlyPrice: 0,
      description: 'Para profissionais iniciando a carreira',
      features: [
        { included: true, text: 'Até 5 agendamentos' },
        { included: true, text: 'Lembretes simples por WhatsApp' },
        { included: true, text: 'Cadastro básico de clientes' },
        { included: false, text: 'Gestão de insumos' },
        { included: false, text: 'Marketing por IA' },
        { included: false, text: 'Painel analítico' },
        { included: false, text: 'Cursos e certificados' },
        { included: false, text: 'Programa de fidelidade' },
      ],
      buttonText: 'Começar Grátis',
    },
    {
      tier: 'starter',
      title: 'Starter',
      price: 59.90,
      yearlyPrice: 47.90,
      description: 'Para profissionais individuais',
      features: [
        { included: true, text: 'Agendamentos ilimitados' },
        { included: true, text: 'Lembretes automáticos personalizados' },
        { included: true, text: 'Gestão completa de clientes' },
        { included: true, text: 'Controle de insumos' },
        { included: true, text: 'Marketing básico' },
        { included: true, text: 'Painel analítico simplificado' },
        { included: false, text: 'Cursos e certificados' },
        { included: false, text: 'Programa de fidelidade avançado' },
      ],
      buttonText: 'Escolher Starter',
    },
    {
      tier: 'pro',
      isPopular: true,
      title: 'Pro',
      price: 99.90,
      yearlyPrice: 79.90,
      description: 'Para profissionais em crescimento',
      features: [
        { included: true, text: 'Agendamentos ilimitados' },
        { included: true, text: 'Lembretes automáticos personalizados' },
        { included: true, text: 'Gestão avançada de clientes' },
        { included: true, text: 'Controle completo de insumos' },
        { included: true, text: 'Marketing com IA' },
        { included: true, text: 'Painel analítico completo' },
        { included: true, text: 'Cursos e certificados' },
        { included: true, text: 'Programa de fidelidade básico' },
      ],
      buttonText: 'Escolher Pro',
    },
    {
      tier: 'premium',
      title: 'Premium',
      price: 179.90,
      yearlyPrice: 143.90,
      description: 'Para quem tem equipe ou rede',
      features: [
        { included: true, text: 'Tudo do plano Pro' },
        { included: true, text: 'Gestão de equipe multiusuário' },
        { included: true, text: 'Automação avançada com IA' },
        { included: true, text: 'Campanhas inteligentes' },
        { included: true, text: 'Programa de afiliados' },
        { included: true, text: 'Biolink personalizado' },
        { included: true, text: 'Programa de fidelidade avançado' },
        { included: true, text: 'Suporte prioritário' },
      ],
      buttonText: 'Escolher Premium',
    },
  ];

  return (
    <section className="py-20" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
            Escolha o <span className="gradient-text">Plano Ideal</span> para Você
          </h2>
          <p className="text-lg text-foreground/70">
            Planos flexíveis para atender a todas as necessidades, desde profissionais
            iniciantes até estabelecimentos com equipes.
          </p>
          
          <div className="mt-8 inline-flex items-center border border-plush-200 p-1 rounded-full bg-white">
            <button
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                !isYearly ? 'bg-plush-600 text-white' : 'text-foreground hover:bg-plush-50'
              }`}
              onClick={() => setIsYearly(false)}
            >
              Mensal
            </button>
            <button
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                isYearly ? 'bg-plush-600 text-white' : 'text-foreground hover:bg-plush-50'
              }`}
              onClick={() => setIsYearly(true)}
            >
              Anual <span className="text-xs font-medium ml-1">(-20%)</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {pricingPlans.map((plan) => (
            <PricingTier
              key={plan.tier}
              tier={plan.tier}
              isPopular={plan.isPopular}
              isYearly={isYearly}
              title={plan.title}
              price={plan.price}
              yearlyPrice={plan.yearlyPrice}
              description={plan.description}
              features={plan.features}
              buttonText={plan.buttonText}
            />
          ))}
        </div>
        
        <div className="mt-16 bg-white rounded-xl border border-plush-100 p-8 shadow-sm">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2 font-serif">Comparação de Recursos</h3>
            <p className="text-foreground/70">
              Veja em detalhes o que está incluso em cada plano
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-plush-100">
                  <th className="text-left pb-4 pl-4">Recursos</th>
                  <th className="text-center pb-4">Free</th>
                  <th className="text-center pb-4">Starter</th>
                  <th className="text-center pb-4 text-plush-600">Pro</th>
                  <th className="text-center pb-4">Premium</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Agendamentos', free: '5 por mês', starter: 'Ilimitados', pro: 'Ilimitados', premium: 'Ilimitados' },
                  { name: 'Lembretes', free: 'Básicos', starter: 'Personalizados', pro: 'Avançados', premium: 'Avançados + IA' },
                  { name: 'Cadastro de Clientes', free: 'Básico', starter: 'Completo', pro: 'Avançado', premium: 'Avançado' },
                  { name: 'Controle de Insumos', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
                  { name: 'Marketing', free: '❌', starter: 'Básico', pro: 'Com IA', premium: 'Avançado + IA' },
                  { name: 'Painel Analítico', free: '❌', starter: 'Simplificado', pro: 'Completo', premium: 'Avançado' },
                  { name: 'Cursos e Certificados', free: '❌', starter: '❌', pro: '✓', premium: '✓' },
                  { name: 'Programa de Fidelidade', free: '❌', starter: '❌', pro: 'Básico', premium: 'Avançado' },
                  { name: 'Gestão de Equipe', free: '❌', starter: '❌', pro: '❌', premium: '✓' },
                  { name: 'Biolink Personalizado', free: '❌', starter: '❌', pro: '❌', premium: '✓' },
                  { name: 'Programa de Afiliados', free: '❌', starter: '❌', pro: '❌', premium: '✓' },
                  { name: 'Suporte', free: 'Email', starter: 'Email e Chat', pro: 'Email e Chat', premium: 'Prioritário' },
                ].map((feature, index) => (
                  <tr key={index} className="border-b border-plush-50">
                    <td className="py-4 pl-4 font-medium">{feature.name}</td>
                    <td className="py-4 text-center text-sm">{feature.free}</td>
                    <td className="py-4 text-center text-sm">{feature.starter}</td>
                    <td className="py-4 text-center text-sm font-medium text-plush-600">{feature.pro}</td>
                    <td className="py-4 text-center text-sm">{feature.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
