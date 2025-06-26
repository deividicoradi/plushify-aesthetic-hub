
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, Eye, Lock, Users } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              Sua privacidade é nossa prioridade
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
              Política de Privacidade
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Última atualização: 25 de junho de 2025
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            
            <div className="bg-muted/30 rounded-lg p-8 space-y-8">
              
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-primary" />
                  1. Informações que Coletamos
                </h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    <strong>Dados de Cadastro:</strong> Nome, e-mail, telefone, CNPJ/CPF e endereço fornecidos durante o registro.
                  </p>
                  <p>
                    <strong>Dados de Uso:</strong> Informações sobre como você utiliza nossa plataforma, incluindo páginas visitadas, recursos utilizados e tempo de sessão.
                  </p>
                  <p>
                    <strong>Dados de Pagamento:</strong> Informações de cobrança processadas através de nossos parceiros de pagamento seguros.
                  </p>
                  <p>
                    <strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional e identificadores de dispositivo.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  2. Como Utilizamos suas Informações
                </h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    <strong>Prestação de Serviços:</strong> Para fornecer, manter e melhorar nossos serviços de gestão.
                  </p>
                  <p>
                    <strong>Comunicação:</strong> Para enviar atualizações, notificações importantes e suporte técnico.
                  </p>
                  <p>
                    <strong>Segurança:</strong> Para proteger nossa plataforma contra fraudes e acessos não autorizados.
                  </p>
                  <p>
                    <strong>Melhorias:</strong> Para analisar o uso da plataforma e desenvolver novos recursos.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  3. Proteção de Dados
                </h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
                  </p>
                  <p>
                    Utilizamos criptografia SSL/TLS para todas as transmissões de dados e armazenamento seguro em servidores certificados.
                  </p>
                  <p>
                    Apenas funcionários autorizados têm acesso aos dados pessoais, mediante acordo de confidencialidade.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Compartilhamento de Dados</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.
                  </p>
                  <p>
                    Podemos compartilhar informações apenas nos seguintes casos:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Com prestadores de serviços essenciais (pagamento, hospedagem)</li>
                    <li>Quando exigido por lei ou ordem judicial</li>
                    <li>Para proteger nossos direitos legais</li>
                    <li>Com seu consentimento explícito</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Seus Direitos</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>Conforme a LGPD, você tem direito a:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Confirmação da existência de tratamento de dados</li>
                    <li>Acesso aos seus dados pessoais</li>
                    <li>Correção de dados incompletos ou incorretos</li>
                    <li>Eliminação de dados desnecessários</li>
                    <li>Portabilidade dos dados</li>
                    <li>Revogação do consentimento</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Retenção de Dados</h2>
                <div className="text-muted-foreground space-y-4">
                  <p>
                    Mantemos seus dados pessoais apenas pelo tempo necessário para os fins para os quais foram coletados, 
                    ou conforme exigido por lei.
                  </p>
                  <p>
                    Após o encerramento da conta, os dados são anonimizados ou eliminados de forma segura, 
                    exceto quando a retenção for necessária para cumprimento de obrigações legais.
                  </p>
                </div>
              </section>

            </div>

            {/* Contato */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contato para Proteção de Dados</h2>
              <p className="text-muted-foreground mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
              </p>
              <div className="bg-background rounded-lg p-4 border border-primary/20">
                <p><strong>E-mail:</strong> privacidade@plushify.com.br</p>
                <p><strong>Encarregado de Dados:</strong> Equipe Plushify</p>
                <p><strong>Endereço:</strong> São Paulo, Brasil</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Privacy;
