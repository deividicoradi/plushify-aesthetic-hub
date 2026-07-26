
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: 'Qual a diferença entre o plano Profissional e o Premium?',
    answer: 'O Profissional cobre a operação do dia a dia: agenda, clientes, financeiro básico, controle de caixa e equipe com até 2 usuários. O Premium adiciona os diferenciais de crescimento: Analytics Avançado, Pacotes de Serviços, Vale-presente, Comissão por profissional, Programa de Fidelidade completo, Modo Funcionário com PIN.'
  },
  {
    question: 'Como funciona o teste grátis de 7 dias?',
    answer: 'Você tem acesso ao sistema por 7 dias sem pagar nada, com limites reduzidos (até 5 clientes, 3 agendamentos, 2 serviços, 10 produtos e 1 usuário). Ao final do período, o acesso é bloqueado até você escolher um plano pago — seus dados cadastrados continuam salvos, nada é apagado.'
  },
  {
    question: 'Posso mudar de plano a qualquer momento?',
    answer: 'Sim, o upgrade é liberado assim que o pagamento é confirmado. Hoje não existe downgrade automático: para migrar para um plano menor, é necessário assinar o novo plano diretamente na tela de Planos.'
  },
  {
    question: 'O que acontece se eu cancelar?',
    answer: 'Sem pegadinhas! Você mantém acesso até o fim do período já pago e pode reativar quando quiser.'
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
