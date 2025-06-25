
import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react';

const LGPD = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <CheckCircle className="w-4 h-4" />
              100% Conforme com a LGPD
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
              Conformidade com a LGPD
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            
            {/* Resumo Executivo */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-green-800 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6" />
                Nosso Compromisso
              </h2>
              <p className="text-green-700 leading-relaxed">
                O Plushify está em total conformidade com a Lei Geral de Proteção de Dados (LGPD). 
                Implementamos todas as medidas técnicas e organizacionais necessárias para garantir 
                a proteção dos dados pessoais de nossos usuários e clientes.
              </p>
            </div>

            {/* Princípios da LGPD */}
            <div className="bg-muted/30 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Princípios que Seguimos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Finalidade</h3>
                      <p className="text-muted-foreground text-sm">Tratamos dados apenas para propósitos específicos e informados.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Adequação</h3>
                      <p className="text-muted-foreground text-sm">Coleta compatível com as finalidades informadas.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Necessidade</h3>
                      <p className="text-muted-foreground text-sm">Limitação ao mínimo necessário para as finalidades.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Livre Acesso</h3>
                      <p className="text-muted-foreground text-sm">Consulta facilitada sobre forma e duração do tratamento.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Qualidade dos Dados</h3>
                      <p className="text-muted-foreground text-sm">Exatidão, clareza e atualização dos dados.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Transparência</h3>
                      <p className="text-muted-foreground text-sm">Informações claras e acessíveis sobre o tratamento.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Segurança</h3>
                      <p className="text-muted-foreground text-sm">Medidas técnicas para proteção dos dados.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Responsabilização</h3>
                      <p className="text-muted-foreground text-sm">Demonstração do cumprimento das normas.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direitos do Titular */}
            <div className="bg-muted/30 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Seus Direitos como Titular dos Dados</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold text-foreground mb-2">Confirmação</h3>
                  <p className="text-muted-foreground text-sm">Confirmar a existência de tratamento de seus dados.</p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold text-foreground mb-2">Acesso</h3>
                  <p className="text-muted-foreground text-sm">Acessar seus dados pessoais tratados.</p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold text-foreground mb-2">Correção</h3>
                  <p className="text-muted-foreground text-sm">Corrigir dados incompletos ou inexatos.</p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold text-foreground mb-2">Anonimização</h3>
                  <p className="text-muted-foreground text-sm">Solicitar anonimização ou bloqueio.</p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold text-foreground mb-2">Eliminação</h3>
                  <p className="text-muted-foreground text-sm">Eliminar dados desnecessários ou excessivos.</p>
                </div>
                
                <div className="bg-background rounded-lg p-4 border">
                  <h3 className="font-semibold text-foreground mb-2">Portabilidade</h3>
                  <p className="text-muted-foreground text-sm">Portabilidade a outro fornecedor.</p>
                </div>
              </div>
            </div>

            {/* Contato DPO */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-primary" />
                Encarregado de Proteção de Dados (DPO)
              </h2>
              <p className="text-muted-foreground mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados:
              </p>
              <div className="bg-background rounded-lg p-4 border">
                <p><strong>E-mail:</strong> dpo@plushify.com.br</p>
                <p><strong>Encarregado:</strong> Equipe de Proteção de Dados Plushify</p>
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

export default LGPD;
