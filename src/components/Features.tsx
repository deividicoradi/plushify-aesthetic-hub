import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, BarChart3, Brain, Mail, Award, Box, Clock, Star } from 'lucide-react';

const Feature = ({ icon, title, description, path }: { icon: React.ReactNode, title: string, description: string, path?: string }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="relative p-6 rounded-xl border border-plush-100 bg-white shadow-sm card-hover cursor-pointer transition-all duration-300 hover:shadow-md"
      onClick={() => path && navigate(path)}
    >
      <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-r from-plush-500 to-plush-600 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium mb-2">{title}</h3>
      <p className="text-foreground/70 text-sm">{description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section id="features" className="py-16 bg-gradient-to-b from-white to-plush-50/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">
            Funcionalidades <span className="gradient-text">Poderosas</span>
          </h2>
          <p className="text-lg text-foreground/70">
            Uma plataforma completa para impulsionar seu negócio de estética
            com ferramentas inteligentes e automatizadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <Feature 
            icon={<Calendar className="w-4 h-4 text-white" />}
            title="Agenda Inteligente"
            description="Agendamentos online com lembretes automáticos e redistribuição de horários para evitar janelas vazias."
            path="/agendamentos"
          />
          
          <Feature 
            icon={<Brain className="w-4 h-4 text-white" />}
            title="Comunicação com IA"
            description="Gere campanhas automáticas e mensagens personalizadas com nossa inteligência artificial."
            path="/comunicacao"
          />
          
          <Feature 
            icon={<Award className="w-4 h-4 text-white" />}
            title="Cursos e Certificados"
            description="Crie e venda cursos com certificados automáticos e área de alunos integrada."
            path="/cursos"
          />
          
          <Feature 
            icon={<Box className="w-4 h-4 text-white" />}
            title="Controle de Insumos"
            description="Gerencie seu estoque com alertas de nível baixo e cálculo automático de consumo por procedimento."
            path="/estoque"
          />
          
          <Feature 
            icon={<Users className="w-4 h-4 text-white" />}
            title="Gestão de Clientes"
            description="Histórico completo, preferências, pontos de fidelidade e lembretes de retorno personalizados."
            path="/clientes"
          />
          
          <Feature 
            icon={<BarChart3 className="w-4 h-4 text-white" />}
            title="Dashboard Analíticos"
            description="Acompanhe métricas importantes do seu negócio com relatórios detalhados e insights valiosos."
            path="/dashboard"
          />
          
          <Feature 
            icon={<Mail className="w-4 h-4 text-white" />}
            title="Marketing Inteligente"
            description="Campanhas automáticas de aniversário, retorno e fidelização com conteúdo gerado por IA."
            path="/comunicacao"
          />
          
          <Feature 
            icon={<Box className="w-4 h-4 text-white" />}
            title="Planos e Assinaturas"
            description="Apresente planos Free, Starter, Pro e Premium com integração Stripe."
            path="/planos"
          />
          
          <Feature 
            icon={<Star className="w-4 h-4 text-white" />}
            title="Programa de Fidelidade"
            description="Sistema de pontos, níveis de cliente e benefícios automáticos para fidelizar sua clientela."
            path="/fidelidade"
          />
        </div>
        
        <div className="mt-16 relative">
          <div className="bg-white rounded-xl p-8 border border-plush-100 shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 font-serif">Aplicativo Web Completo</h3>
                <p className="text-foreground/70 mb-6">
                  O Plushify é um aplicativo web progressivo (PWA) que pode ser instalado 
                  em qualquer dispositivo. Acesse de qualquer lugar e mantenha seu negócio 
                  funcionando mesmo offline.
                </p>
                <ul className="space-y-3">
                  {[
                    'Funciona em qualquer dispositivo (computador, tablet, celular)',
                    'Pode ser instalado como um aplicativo nativo',
                    'Funciona mesmo sem internet (modo offline)',
                    'Receba notificações de novos agendamentos',
                    'Dados seguros e sempre sincronizados'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="min-w-5 h-5 rounded-full bg-plush-100 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-plush-600 text-xs">✓</span>
                      </div>
                      <span className="text-sm text-foreground/80">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative">
                <div className="bg-plush-50 rounded-lg p-6 relative z-10">
                  <div className="flex space-x-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-plush-600 flex items-center justify-center text-white">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium">Assistente IA</h4>
                      <p className="text-sm text-foreground/70">Seu assistente pessoal inteligente</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg rounded-tl-none shadow-sm border border-plush-100">
                      <p className="text-sm">Como posso ajudar você hoje?</p>
                      <p className="text-xs text-foreground/60 mt-1">Assistente Plushify, 10:30</p>
                    </div>
                    
                    <div className="bg-plush-100 p-4 rounded-lg rounded-tr-none shadow-sm">
                      <p className="text-sm">Preciso enviar uma campanha para meus clientes que não retornam há mais de 30 dias</p>
                      <p className="text-xs text-foreground/60 mt-1">Você, 10:32</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg rounded-tl-none shadow-sm border border-plush-100">
                      <p className="text-sm">Criei uma campanha personalizada para reconquista de clientes. Você tem 28 clientes inativos há mais de 30 dias. Deseja enviar agora?</p>
                      <p className="text-xs text-foreground/60 mt-1">Assistente Plushify, 10:33</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 relative">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      className="w-full bg-white border border-plush-200 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-plush-500"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-plush-600 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-plush-200 rounded-full opacity-20 -z-10"></div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent2-200 rounded-full opacity-20 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

export default Features;
