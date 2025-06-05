
import React from 'react';

export const ComparisonTable = () => {
  return (
    <div className="mt-16 bg-white rounded-xl border border-plush-100 p-8 shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 font-serif">Comparação Detalhada de Recursos</h3>
        <p className="text-foreground/70">
          Veja em detalhes todas as funcionalidades incluídas em cada plano
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-plush-100">
              <th className="text-left pb-4 pl-4 font-semibold">Recursos</th>
              <th className="text-center pb-4 font-semibold">Free</th>
              <th className="text-center pb-4 font-semibold">Starter<br/><span className="text-xs font-normal text-gray-600">R$69,90/mês</span></th>
              <th className="text-center pb-4 font-semibold text-plush-600">Pro<br/><span className="text-xs font-normal text-gray-600">R$119,90/mês</span></th>
              <th className="text-center pb-4 font-semibold">Premium<br/><span className="text-xs font-normal text-gray-600">R$199,90/mês</span></th>
            </tr>
          </thead>
          <tbody>
            {[
              // Funcionalidades Básicas
              { category: 'FUNCIONALIDADES BÁSICAS', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Cadastro de Clientes', free: '5 clientes', starter: 'Ilimitados', pro: 'Ilimitados', premium: 'Ilimitados' },
              { name: 'Agendamentos', free: '10/mês', starter: 'Ilimitados', pro: 'Ilimitados', premium: 'Ilimitados' },
              { name: 'Dashboard', free: 'Limitado', starter: 'Completo', pro: 'Avançado', premium: 'Personalizado' },
              { name: 'Backup de Dados', free: '❌', starter: '✓ Automático', pro: '✓ Automático', premium: '✓ Redundante' },
              
              // Comunicação e Marketing
              { category: 'COMUNICAÇÃO E MARKETING', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Lembretes por Email', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'Lembretes por SMS', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'WhatsApp Automático', free: '❌', starter: '❌', pro: '✓', premium: '✓ Avançado' },
              { name: 'Campanhas de Marketing', free: '❌', starter: '❌', pro: '✓ Básicas', premium: '✓ IA Personalizada' },
              { name: 'Integração Redes Sociais', free: '❌', starter: '❌', pro: '✓', premium: '✓ Completa' },
              
              // Relatórios e Análises
              { category: 'RELATÓRIOS E ANÁLISES', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Relatórios Básicos', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'Relatórios com IA', free: '❌', starter: '❌', pro: '✓', premium: '✓ Personalizados' },
              { name: 'Análises Preditivas', free: '❌', starter: '❌', pro: '✓', premium: '✓ Avançadas' },
              { name: 'Exportação PDF/Excel', free: '❌', starter: 'Básica', pro: 'Completa', premium: 'Personalizada' },
              
              // Gestão Avançada
              { category: 'GESTÃO AVANÇADA', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Controle de Estoque', free: '❌', starter: 'Básico', pro: 'Completo', premium: 'IA Integrada' },
              { name: 'Sistema de Fidelidade', free: '❌', starter: '❌', pro: '✓', premium: '✓ Personalizado' },
              { name: 'CRM Integrado', free: '❌', starter: '❌', pro: 'Básico', premium: '✓ Completo' },
              { name: 'Sistema de Vendas', free: '❌', starter: '❌', pro: '❌', premium: '✓ Com Comissões' },
              
              // Recursos Premium Exclusivos
              { category: 'RECURSOS PREMIUM EXCLUSIVOS', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Gestão de Equipe Multi-usuário', free: '❌', starter: '❌', pro: '❌', premium: '✓ Completa' },
              { name: 'IA Personalizada', free: '❌', starter: '❌', pro: '❌', premium: '✓ Seu Negócio' },
              { name: 'API Personalizada', free: '❌', starter: '❌', pro: '❌', premium: '✓ Documentada' },
              { name: 'Biolink Personalizado', free: '❌', starter: '❌', pro: '❌', premium: '✓ Seu Domínio' },
              { name: 'Programa de Afiliados', free: '❌', starter: '❌', pro: '❌', premium: '✓ Completo' },
              { name: 'Integração com ERPs', free: '❌', starter: '❌', pro: '❌', premium: '✓ SAP, Totvs, etc' },
              
              // Suporte e Treinamento
              { category: 'SUPORTE E TREINAMENTO', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Suporte por Email', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'Suporte por Chat', free: '❌', starter: '✓', pro: '✓', premium: '✓ Prioritário' },
              { name: 'Suporte 24/7', free: '❌', starter: '❌', pro: '❌', premium: '✓' },
              { name: 'Consultoria Estratégica', free: '❌', starter: '❌', pro: '❌', premium: '✓ Mensal' },
              { name: 'Treinamento da Equipe', free: '❌', starter: '❌', pro: '❌', premium: '✓ Incluído' },
              { name: 'Cursos e Certificados', free: '❌', starter: '❌', pro: '✓', premium: '✓ Avançados' },
              
              // Pagamento e Facilidades
              { category: 'FACILIDADES DE PAGAMENTO', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Opção de Parcelamento', free: '❌', starter: 'Até 10x', pro: 'Até 10x', premium: 'Até 12x' },
              { name: 'Desconto Anual', free: '❌', starter: '20%', pro: '20%', premium: '20%' },
              { name: 'Período de Teste', free: '❌', starter: '7 dias', pro: '14 dias', premium: '30 dias' },
            ].map((feature, index) => (
              <tr key={index} className={`border-b border-plush-50 ${feature.isHeader ? 'bg-gray-50' : ''}`}>
                <td className={`py-4 pl-4 ${feature.isHeader ? 'font-bold text-gray-800 text-sm uppercase tracking-wide' : 'font-medium'}`}>
                  {feature.name || feature.category}
                </td>
                <td className={`py-4 text-center text-sm ${feature.isHeader ? '' : ''}`}>{feature.free}</td>
                <td className={`py-4 text-center text-sm ${feature.isHeader ? '' : ''}`}>{feature.starter}</td>
                <td className={`py-4 text-center text-sm ${feature.isHeader ? '' : 'font-medium text-plush-600'}`}>{feature.pro}</td>
                <td className={`py-4 text-center text-sm ${feature.isHeader ? '' : 'font-medium text-purple-600'}`}>{feature.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-plush-50 rounded-lg border border-purple-200">
        <h4 className="text-lg font-bold text-purple-800 mb-2">🚀 Por que escolher o Premium?</h4>
        <p className="text-purple-700 text-sm leading-relaxed">
          O plano Premium foi desenvolvido para empresas que querem uma solução completa e personalizada. 
          Com IA exclusiva para seu negócio, gestão de equipe completa, integrações avançadas e consultoria estratégica, 
          você terá tudo que precisa para escalar seu negócio de forma inteligente e automatizada.
        </p>
      </div>
    </div>
  );
};
