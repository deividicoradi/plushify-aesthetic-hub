import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FileText, CheckCircle, AlertCircle, Scale } from 'lucide-react';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Scale className="w-4 h-4" />
              Transparência e clareza
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
              Termos de Serviço
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Última atualização: 03 de agosto de 2026
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            
            <div className="bg-muted/30 rounded-lg p-8 space-y-8">
              
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  1. Aceitação dos Termos
                </h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Ao acessar ou usar a plataforma Plushify, você concorda em cumprir estes Termos de Serviço 
                    e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, 
                    por favor, não utilize a nossa plataforma.
                  </p>
                  <p>
                    O uso contínuo de nossos serviços constitui aceitação automática de quaisquer atualizações 
                    ou modificações destes termos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  2. Uso da Plataforma
                </h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    O Plushify oferece ferramentas para gestão de salões de beleza e clínicas de estética. 
                    Você concorda em usar a plataforma apenas para fins legais e de acordo com todas as normas aplicáveis.
                  </p>
                  <p>
                    <strong>Atividades Proibidas:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Uso para fins ilegais ou não autorizados</li>
                    <li>Tentativas de acesso não autorizado ao sistema</li>
                    <li>Distribuição de malware ou conteúdo malicioso</li>
                    <li>Violação de direitos de propriedade intelectual</li>
                    <li>Interferência no funcionamento normal da plataforma</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Conta do Usuário</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Para usar nossos serviços, você deve criar uma conta fornecendo informações precisas e atualizadas. 
                    Você é responsável por manter a confidencialidade de suas credenciais de acesso.
                  </p>
                  <p>
                    <strong>Responsabilidades do Usuário:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Manter informações de conta atualizadas</li>
                    <li>Proteger suas credenciais de acesso</li>
                    <li>Notificar imediatamente sobre uso não autorizado</li>
                    <li>Ser responsável por todas as atividades em sua conta</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Propriedade Intelectual</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Todo o conteúdo da plataforma, incluindo textos, imagens, logos, códigos e funcionalidades, 
                    pertence ao Plushify ou seus licenciadores. É proibida a reprodução ou uso sem autorização 
                    prévia, exceto nos casos permitidos por lei.
                  </p>
                  <p>
                    Você mantém a propriedade dos dados que insere na plataforma, mas nos concede licença 
                    para processá-los conforme necessário para prestar nossos serviços.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Planos e Pagamentos</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Os serviços do Plushify estão disponíveis em diferentes planos, cada um com funcionalidades 
                    e limitações específicas. Os pagamentos são processados de forma segura através de nossos 
                    parceiros de pagamento.
                  </p>
                  <p>
                    <strong>Política de Cancelamento (planos mensais):</strong> Você pode cancelar sua assinatura
                    a qualquer momento, diretamente pelas configurações da sua conta, sem burocracia e sem
                    precisar justificar o motivo. O cancelamento interrompe a renovação e você mantém acesso até
                    o final do período de cobrança já pago, sem qualquer multa.
                  </p>
                  <p>
                    <strong>Política de Cancelamento (planos anuais):</strong> Ao cancelar um plano anual antes
                    do fim dos 12 meses contratados, você recebe o reembolso proporcional aos meses ainda não
                    utilizados, descontada uma multa rescisória de 10% sobre esse valor proporcional (nunca
                    sobre o valor total do contrato), em linha com o princípio da proporcionalidade adotado pela
                    jurisprudência sobre multas de cancelamento antecipado. Exemplo: em um plano anual de
                    R$ 1.200,00 (R$ 100,00/mês), ao cancelar após 4 meses de uso, restam 8 meses (R$ 800,00);
                    a multa de 10% equivale a R$ 80,00, e o reembolso é de R$ 720,00. A solicitação de
                    cancelamento é registrada imediatamente pelas configurações da sua conta; o reembolso
                    proporcional é processado por nossa equipe em seguida, sem cobrança de novas parcelas a
                    partir do pedido.
                  </p>
                  <p>
                    <strong>Reajuste de Preços:</strong> Os valores dos planos podem ser reajustados a qualquer
                    momento, a nosso critério. Qualquer reajuste será comunicado com no mínimo 30 dias de
                    antecedência antes de entrar em vigor, dando tempo para você decidir se deseja continuar
                    com o plano nas novas condições.
                  </p>
                  <p>
                    <strong>Upgrade de Plano (planos anuais):</strong> Ao migrar para um plano anual de valor
                    superior antes do fim do período contratado, o valor já pago pelos dias não utilizados do
                    plano atual é convertido integralmente em crédito (sem multa, diferente do cancelamento) e
                    abatido do valor cheio do novo plano. Você paga apenas a diferença, calculada
                    proporcionalmente aos dias restantes do seu ciclo atual, e visualiza esse valor antes de
                    confirmar a cobrança. A partir da confirmação, seu plano é alterado imediatamente e um novo
                    período de 12 meses tem início a partir da data do upgrade.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Direito de Arrependimento</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Nos termos do artigo 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990), por se tratar
                    de contratação realizada fora do estabelecimento comercial (à distância, pela internet), você
                    tem o direito de desistir da assinatura em até <strong>7 (sete) dias corridos</strong> a
                    contar da data da contratação (assinatura do plano) ou do recebimento/ativação do serviço, o
                    que ocorrer por último.
                  </p>
                  <p>
                    Exercido esse direito dentro do prazo, você recebe o <strong>reembolso integral</strong> dos
                    valores pagos, sem qualquer desconto ou penalidade, monetariamente atualizados quando
                    aplicável. Para solicitar, abra um chamado em Central de Ajuda → Meus Chamados, ou entre em
                    contato pelo e-mail de suporte informado ao final destes Termos.
                  </p>
                  <p>
                    Esse direito de arrependimento é distinto e não se confunde com as políticas de cancelamento
                    e reembolso proporcional descritas na seção 5 acima, que se aplicam a cancelamentos feitos
                    <strong> após</strong> o prazo de 7 dias.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitação de Responsabilidade</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    O Plushify fornece a plataforma "como está" e não garante que será livre de erros ou 
                    interrupções. Nossa responsabilidade é limitada ao valor pago pelos serviços no período 
                    em que ocorreu o problema.
                  </p>
                  <p>
                    Não somos responsáveis por danos indiretos, perda de dados ou lucros cessantes decorrentes 
                    do uso ou impossibilidade de uso da plataforma.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Suporte, Manutenção e Correção de Falhas</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Nos empenhamos para manter a plataforma disponível e livre de falhas, mas, como qualquer
                    sistema de software, o Plushify pode apresentar bugs ou indisponibilidades pontuais. Quando
                    uma falha que compromete o funcionamento do serviço contratado (vício, nos termos do art. 18
                    do Código de Defesa do Consumidor) é formalmente reportada por você através dos nossos
                    canais de suporte, buscamos saná-la dentro do seguinte prazo, contado a partir da abertura
                    do chamado:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Urgente</strong> (bloqueia o uso da plataforma): até 7 dias.</li>
                    <li><strong>Atenção</strong> (afeta funcionalidade específica, sem bloquear o uso geral): até 15 dias.</li>
                    <li><strong>Normal</strong> (impacto limitado ou solução alternativa disponível): até 30 dias.</li>
                  </ul>
                  <p>
                    O prazo máximo de 30 dias observa o limite estabelecido pelo art. 18, §1º do CDC para
                    sanar vícios de qualidade do serviço. Caso o prazo aplicável não seja cumprido, você pode
                    exigir, à sua escolha: (i) reexecução do serviço; (ii) abatimento proporcional do valor pago;
                    ou (iii) rescisão do contrato com devolução dos valores pagos, sem prejuízo de eventuais perdas
                    e danos.
                  </p>
                  <p>
                    Melhorias, novas funcionalidades e ajustes que não configuram vício do serviço contratado
                    seguem nosso backlog de desenvolvimento e não estão sujeitos a este prazo.
                  </p>
                  <p>
                    Manutenções programadas que exijam indisponibilidade temporária serão comunicadas com
                    antecedência razoável sempre que possível.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Suspensão e Cancelamento</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Reservamo-nos o direito de suspender ou encerrar o acesso de qualquer usuário que viole 
                    estes Termos ou que faça uso indevido da plataforma, sem aviso prévio quando necessário 
                    para proteger a integridade do sistema.
                  </p>
                  <p>
                    Em caso de suspensão por violação, você pode solicitar revisão através de nossos canais de suporte.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. Alterações dos Termos</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Podemos atualizar estes Termos periodicamente para refletir mudanças em nossos serviços 
                    ou requisitos legais. Quaisquer alterações serão comunicadas aos usuários com pelo menos 
                    30 dias de antecedência.
                  </p>
                  <p>
                    O uso contínuo da plataforma após as alterações constitui aceitação dos novos termos.
                  </p>
                </div>
              </section>

            </div>

            {/* Contato */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-primary" />
                Dúvidas sobre os Termos?
              </h2>
              <p className="text-muted-foreground mb-4">
                Se você tiver alguma dúvida sobre estes Termos de Serviço, entre em contato conosco:
              </p>
              <div className="bg-background rounded-lg p-4 border border-primary/20">
                <p><strong>E-mail:</strong> plushify.suporte@gmail.com</p>
                <p><strong>Assunto:</strong> "Dúvidas sobre Termos de Serviço"</p>
                <p><strong>Horário de Atendimento:</strong> Segunda a Sexta, 9h às 18h</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Terms;
