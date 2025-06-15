
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: 'Por que o plano Enterprise é o mais recomendado?',
    answer: 'O Enterprise oferece todas as ferramentas necessárias para escalar seu negócio: analytics avançados, múltiplos usuários, consultoria mensal e suporte VIP. É o investimento que mais gera retorno.'
  },
  {
    question: 'Como funciona a consultoria mensal gratuita?',
    answer: 'Clientes Enterprise recebem 1 hora de consultoria mensal com nossos especialistas para otimizar processos, aumentar vendas e crescer o negócio.'
  },
  {
    question: 'Posso mudar de plano a qualquer momento?',
    answer: 'Sim! Você pode fazer upgrade instantâneo. O downgrade acontece no próximo ciclo de cobrança.'
  },
  {
    question: 'O que acontece se eu cancelar?',
    answer: 'Sem pegadinhas! Você mantém acesso até o fim do período pago e pode reativar quando quiser.'
  }
];

export const FAQSection: React.FC = () => {
  return (
    <div className="space-y-6 py-6">
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold">
          Perguntas Frequentes
        </h2>
        <p className="text-lg text-muted-foreground">
          Tudo que você precisa saber para tomar a melhor decisão
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {faqs.map((faq, index) => (
          <Card key={index} className="hover:shadow-md transition-all duration-300 p-6">
            <CardContent className="p-0">
              <h3 className="font-semibold mb-3 text-base leading-relaxed">
                {faq.question}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
