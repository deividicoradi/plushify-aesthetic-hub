
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Cookie, Settings, Shield, Info } from 'lucide-react';

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Cookie className="w-4 h-4" />
              Transparência total
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
              Política de Cookies
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Como utilizamos cookies para melhorar sua experiência
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            
            {/* O que são cookies */}
            <div className="bg-muted/30 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-primary" />
                O que são Cookies?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita nosso site. 
                Eles nos ajudam a oferecer uma experiência personalizada e melhorar nossos serviços.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies apenas quando necessário para o funcionamento da plataforma e sempre em conformidade 
                com a Lei Geral de Proteção de Dados (LGPD).
              </p>
            </div>

            {/* Tipos de cookies */}
            <div className="bg-muted/30 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-primary" />
                Tipos de Cookies que Utilizamos
              </h2>
              
              <div className="space-y-6">
                
                {/* Cookies Essenciais */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cookies Essenciais</h3>
                  <p className="text-muted-foreground mb-3">
                    Necessários para o funcionamento básico da plataforma. Não podem ser desabilitados.
                  </p>
                  <div className="bg-background rounded-lg p-4 border">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Autenticação de sessão do usuário</li>
                      <li>• Preferências de idioma e região</li>
                      <li>• Configurações de segurança</li>
                      <li>• Carrinho de compras e processo de checkout</li>
                    </ul>
                  </div>
                </div>

                {/* Cookies Funcionais */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cookies Funcionais</h3>
                  <p className="text-muted-foreground mb-3">
                    Melhoram a funcionalidade e personalização da sua experiência.
                  </p>
                  <div className="bg-background rounded-lg p-4 border">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Preferências de tema (claro/escuro)</li>
                      <li>• Configurações de dashboard personalizadas</li>
                      <li>• Lembrança de formulários preenchidos</li>
                      <li>• Estado de componentes expandidos/recolhidos</li>
                    </ul>
                  </div>
                </div>

                {/* Cookies de Performance */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cookies de Performance</h3>
                  <p className="text-muted-foreground mb-3">
                    Coletam informações sobre como você usa nossa plataforma para melhorarmos continuamente.
                  </p>
                  <div className="bg-background rounded-lg p-4 border">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Páginas mais visitadas</li>
                      <li>• Tempo de carregamento das páginas</li>
                      <li>• Recursos mais utilizados</li>
                      <li>• Identificação de erros técnicos</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* Gerenciamento de cookies */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Como Gerenciar seus Cookies
              </h2>
              
              <div className="space-y-4">
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold text-foreground mb-2">Pelo Navegador</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    Você pode controlar e excluir cookies através das configurações do seu navegador:
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                    <li>• Chrome: Configurações → Privacidade e segurança → Cookies</li>
                    <li>• Firefox: Preferências → Privacidade e segurança</li>
                    <li>• Safari: Preferências → Privacidade</li>
                    <li>• Edge: Configurações → Cookies e permissões de site</li>
                  </ul>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold text-foreground mb-2">Na Nossa Plataforma</h3>
                  <p className="text-muted-foreground text-sm">
                    Acesse suas configurações de privacidade no painel de controle da sua conta para 
                    gerenciar suas preferências de cookies funcionais e de performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Atualizações */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Atualizações desta Política</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas 
                práticas ou por outros motivos operacionais, legais ou regulamentares.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong>Data da última atualização:</strong> 25 de junho de 2025
              </p>
            </div>

            {/* Contato */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-orange-800 mb-4">Dúvidas sobre Cookies?</h2>
              <p className="text-orange-700 mb-4">
                Se você tiver alguma dúvida sobre nossa política de cookies, entre em contato conosco:
              </p>
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <p><strong>E-mail:</strong> privacidade@plushify.com.br</p>
                <p><strong>Assunto:</strong> "Dúvidas sobre Cookies"</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Cookies;
