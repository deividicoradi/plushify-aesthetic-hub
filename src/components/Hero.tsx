
import React from 'react';
import { ArrowRight, Calendar, MessageSquare, Award, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  const handleStartFree = () => {
    navigate('/auth?tab=signup');
  };

  const handleShowDemo = () => {
    // Scroll to features section
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  return (
    <section className="relative pt-28 pb-20 overflow-hidden bg-background">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl opacity-60 -z-10"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent/20 rounded-full filter blur-3xl opacity-60 -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              ✨ Software para profissionais de estética
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif leading-tight text-foreground">
              <span className="gradient-text">Sua estética,</span> seu negócio, sua liberdade
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
              Gerencie agendamentos, clientes, campanhas e cursos com um sistema completo e inteligente para profissionais de estética.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 rounded-full shadow-md"
                onClick={handleStartFree}
              >
                Começar Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-border hover:border-primary/30 text-foreground hover:bg-accent h-12 px-8 rounded-full"
                onClick={handleShowDemo}
              >
                Ver Demonstração
              </Button>
            </div>
            
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center lg:text-left">
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Agendamento Inteligente</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Comunicação com IA</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Cursos & Certificados</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <PenTool className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Controle de Insumos</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 bg-card rounded-xl shadow-xl overflow-hidden border border-border">
              <div className="bg-muted p-2 border-b border-border">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20"></div>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20"></div>
                  <div className="w-3 h-3 rounded-full bg-muted-foreground/20"></div>
                </div>
              </div>
              
              <div className="p-4">
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
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-10 -right-10 bg-card rounded-lg p-3 shadow-lg border border-border animate-float hidden md:block">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Novo agendamento</p>
                  <p className="text-xs text-muted-foreground">Procedimento confirmado</p>
                </div>
              </div>
            </div>
            
            {/* Agenda do Dia floating element replacing AI Assistant */}
            <div className="absolute -bottom-5 -left-10 bg-card rounded-lg shadow-lg border border-border animate-float hidden md:block overflow-hidden" style={{ animationDelay: '1s' }}>
              <div className="bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">
                Agenda do Dia
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium">Ana Silva</span>
                  <span className="text-muted-foreground">09:00</span>
                </div>
                <div className="text-xs text-muted-foreground">Limpeza de Pele</div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-foreground font-medium">Mariana Costa</span>
                  <span className="text-muted-foreground">11:00</span>
                </div>
                <div className="text-xs text-muted-foreground">Design de Sobrancelhas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
