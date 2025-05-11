
import React from 'react';

export const ComparisonTable = () => {
  return (
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
  );
};
