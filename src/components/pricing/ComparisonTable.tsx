
import React from 'react';

export const ComparisonTable = () => {
  return (
    <div className="mt-16 bg-card rounded-xl border border-border p-8 shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2 font-serif text-card-foreground">Comparação Detalhada de Recursos</h3>
        <p className="text-muted-foreground">
          Veja em detalhes todas as funcionalidades incluídas em cada plano
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-4 pl-4 font-semibold text-card-foreground">Recursos</th>
              <th className="text-center pb-4 font-semibold text-card-foreground">Free</th>
              <th className="text-center pb-4 font-semibold text-card-foreground">Starter<br/><span className="text-xs font-normal text-muted-foreground">R$69,90/mês</span></th>
              <th className="text-center pb-4 font-semibold text-primary">Pro<br/><span className="text-xs font-normal text-muted-foreground">R$119,90/mês</span></th>
              <th className="text-center pb-4 font-semibold text-card-foreground">Premium<br/><span className="text-xs font-normal text-muted-foreground">R$199,90/mês</span></th>
            </tr>
          </thead>
          <tbody>
            {[
              // Funcionalidades Básicas
              { category: 'FUNCIONALIDADES BÁSICAS', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Cadastro de Clientes', free: '5 clientes', starter: 'Ilimitados', pro: 'Ilimitados', premium: 'Ilimitados' },
              { name: 'Agendamentos', free: '10/mês', starter: 'Ilimitados', pro: 'Ilimitados', premium: 'Ilimitados' },
              { name: 'Dashboard com Métricas', free: 'Limitado', starter: 'Completo', pro: 'Completo', premium: 'Completo' },
              { name: 'Cadastro de Serviços', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'Controle de Estoque', free: '❌', starter: '✓ Básico', pro: '✓ Completo', premium: '✓ Avançado' },
              { name: 'Notas e Observações', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              
              // Relatórios e Análises
              { category: 'RELATÓRIOS', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Relatórios Básicos', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'Análises Avançadas', free: '❌', starter: '❌', pro: '✓', premium: '✓' },
              { name: 'Exportação de Dados', free: '❌', starter: 'Básica', pro: 'Completa', premium: 'Personalizada' },
              
              // Comunicação
              { category: 'COMUNICAÇÃO', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Sistema de Comunicação', free: '❌', starter: '✓ Básico', pro: '✓ Completo', premium: '✓ Avançado' },
              { name: 'Templates de Mensagens', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'Integração WhatsApp', free: '❌', starter: '❌', pro: '✓', premium: '✓' },
              
              // Sistema de Fidelidade
              { category: 'FIDELIDADE', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Sistema de Fidelidade', free: '❌', starter: '❌', pro: '✓', premium: '✓' },
              { name: 'Automação de Pontos', free: '❌', starter: '❌', pro: '✓', premium: '✓' },
              
              // Suporte
              { category: 'SUPORTE', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Documentação', free: '✓', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'Suporte por Email', free: '❌', starter: '✓', pro: '✓', premium: '✓' },
              { name: 'Suporte Prioritário', free: '❌', starter: '❌', pro: '✓', premium: '✓' },
              
              // Facilidades de Pagamento
              { category: 'FACILIDADES DE PAGAMENTO', free: '', starter: '', pro: '', premium: '', isHeader: true },
              { name: 'Período de Teste', free: '❌', starter: '7 dias', pro: '14 dias', premium: '30 dias' },
              { name: 'Desconto Anual', free: '❌', starter: '20%', pro: '20%', premium: '20%' },
              { name: 'Parcelamento', free: '❌', starter: 'Até 10x', pro: 'Até 10x', premium: 'Até 12x' },
            ].map((feature, index) => (
              <tr key={index} className={`border-b border-border ${feature.isHeader ? 'bg-muted' : ''}`}>
                <td className={`py-4 pl-4 ${feature.isHeader ? 'font-bold text-card-foreground text-sm uppercase tracking-wide' : 'font-medium text-card-foreground'}`}>
                  {feature.name || feature.category}
                </td>
                <td className={`py-4 text-center text-sm text-card-foreground ${feature.isHeader ? '' : ''}`}>{feature.free}</td>
                <td className={`py-4 text-center text-sm text-card-foreground ${feature.isHeader ? '' : ''}`}>{feature.starter}</td>
                <td className={`py-4 text-center text-sm ${feature.isHeader ? 'text-card-foreground' : 'font-medium text-primary'}`}>{feature.pro}</td>
                <td className={`py-4 text-center text-sm ${feature.isHeader ? 'text-card-foreground' : 'font-medium text-purple-600 dark:text-purple-400'}`}>{feature.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <h4 className="text-lg font-bold text-primary mb-2">🚀 Por que escolher o Premium?</h4>
        <p className="text-card-foreground text-sm leading-relaxed">
          O plano Premium oferece todas as funcionalidades desenvolvidas, incluindo análises avançadas, 
          sistema de fidelidade completo, integração WhatsApp e automação personalizada para seu negócio.
        </p>
      </div>
    </div>
  );
};
