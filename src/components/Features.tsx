import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, BarChart3, Box, CreditCard, Star } from 'lucide-react';

const Feature = ({ icon, title, description, path }: { icon: React.ReactNode, title: string, description: string, path?: string }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="relative p-6 rounded-xl border border-border bg-card shadow-sm card-hover cursor-pointer transition-all duration-300 hover:shadow-md"
      onClick={() => path && navigate(path)}
    >
      <div className="absolute -top-4 left-6 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section id="features" className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif text-foreground">
            Funcionalidades <span className="gradient-text">Disponíveis</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Gerencie seu negócio de estética com as ferramentas já implementadas 
            em nossa plataforma completa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <Feature 
            icon={<Calendar className="w-4 h-4 text-white" />}
            title="Agenda Inteligente"
            description="Sistema completo de agendamentos com visualização por dia, semana e mês. Gerencie seus horários de forma eficiente."
            path="/agendamentos"
          />
          
          <Feature 
            icon={<Users className="w-4 h-4 text-white" />}
            title="Gestão de Clientes"
            description="Cadastro completo de clientes com histórico, informações pessoais e controle de relacionamento."
            path="/clientes"
          />
          
          <Feature 
            icon={<Box className="w-4 h-4 text-white" />}
            title="Controle de Estoque"
            description="Gerencie seus produtos, insumos e materiais com controle de entrada, saída e alertas de estoque baixo."
            path="/estoque"
          />
          
          <Feature 
            icon={<CreditCard className="w-4 h-4 text-white" />}
            title="Gestão Financeira"
            description="Controle de pagamentos, parcelamentos, fechamento de caixa e controle de despesas do seu negócio."
            path="/financeiro"
          />
          
          <Feature 
            icon={<BarChart3 className="w-4 h-4 text-white" />}
            title="Relatórios e Dashboard"
            description="Acompanhe o desempenho do seu negócio com relatórios detalhados e métricas importantes."
            path="/dashboard"
          />
          
          <Feature 
            icon={<Star className="w-4 h-4 text-white" />}
            title="Programa de Fidelidade"
            description="Sistema de pontos e benefícios para seus clientes, com controle automático de recompensas."
            path="/fidelidade"
          />
        </div>
        
        {/* Seção da Agenda do Dia */}
        <div className="mt-16 relative">
          <div className="bg-card rounded-xl p-8 border border-border shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 font-serif text-foreground">Agenda do Dia - Controle Total</h3>
                <p className="text-muted-foreground mb-6">
                  Visualize todos os seus agendamentos do dia em uma interface intuitiva e organizada. 
                  Acompanhe horários, clientes e procedimentos de forma simples e eficiente.
                </p>
                <ul className="space-y-3">
                  {[
                    'Visualização clara de todos os agendamentos',
                    'Informações detalhadas de cada cliente',
                    'Horários precisos e organizados',
                    'Fácil navegação entre diferentes dias',
                    'Interface responsiva para qualquer dispositivo'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="min-w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-primary text-xs">✓</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative">
                <div className="bg-muted rounded-lg p-6 relative z-10">
                  <div className="rounded-lg overflow-hidden shadow-sm">
                    <div className="p-4 bg-primary text-primary-foreground">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Agenda do Dia</h3>
                        <span className="text-sm">Segunda, 19 Abril</span>
                      </div>
                    </div>
                    
                    <div className="bg-card p-4">
                      <div className="space-y-4">
                        <div className="flex items-center p-3 border rounded-lg border-border bg-muted/50">
                          <div className="w-2 h-10 bg-primary rounded-full mr-4"></div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium text-foreground">Ana Silva</p>
                              <span className="text-sm text-muted-foreground">09:00 - 10:30</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Limpeza de Pele Profunda</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 border rounded-lg border-border">
                          <div className="w-2 h-10 bg-secondary rounded-full mr-4"></div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium text-foreground">Mariana Costa</p>
                              <span className="text-sm text-muted-foreground">11:00 - 12:00</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Design de Sobrancelhas</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 border rounded-lg border-border">
                          <div className="w-2 h-10 bg-accent rounded-full mr-4"></div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <p className="font-medium text-foreground">Regina Pires</p>
                              <span className="text-sm text-muted-foreground">14:00 - 15:30</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Massagem Relaxante</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <button className="text-primary text-sm font-medium hover:text-primary/80">
                          Ver agenda completa →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary/10 rounded-full opacity-20 -z-10"></div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/20 rounded-full opacity-20 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 relative">
          <div className="bg-card rounded-xl p-8 border border-border shadow-lg">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 font-serif text-foreground">Aplicativo Web Completo</h3>
                <p className="text-muted-foreground mb-6">
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
                      <div className="min-w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-primary text-xs">✓</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="relative">
                <div className="bg-muted rounded-lg p-6 relative z-10">
                  <div className="flex space-x-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Agenda Inteligente</h4>
                      <p className="text-sm text-muted-foreground">Controle total da sua agenda</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-foreground">Ana Silva</p>
                        <span className="text-xs text-muted-foreground">09:00</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Limpeza de Pele Profunda</p>
                    </div>
                    
                    <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-foreground">Mariana Costa</p>
                        <span className="text-xs text-muted-foreground">11:00</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Design de Sobrancelhas</p>
                    </div>
                    
                    <div className="bg-card p-4 rounded-lg shadow-sm border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-foreground">Regina Pires</p>
                        <span className="text-xs text-muted-foreground">14:00</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Massagem Relaxante</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <button className="text-primary text-sm font-medium hover:text-primary/80">
                      Ver agenda completa →
                    </button>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-primary/10 rounded-full opacity-20 -z-10"></div>
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/20 rounded-full opacity-20 -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
