
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
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-64 h-64 bg-plush-100 rounded-full filter blur-3xl opacity-60 -z-10"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent2-100 rounded-full filter blur-3xl opacity-60 -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-plush-50 border border-plush-200 text-plush-700 text-sm font-medium">
              ✨ Software para profissionais de estética
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif leading-tight">
              <span className="gradient-text">Sua estética,</span> seu negócio, sua liberdade
            </h1>
            <p className="text-lg text-foreground/80 mb-8 max-w-lg mx-auto lg:mx-0">
              Gerencie agendamentos, clientes, campanhas e cursos com um sistema completo e inteligente para profissionais de estética.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-plush-600 hover:bg-plush-700 text-white h-12 px-8 rounded-full shadow-md"
                onClick={handleStartFree}
              >
                Começar Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-plush-200 hover:border-plush-400 text-plush-700 h-12 px-8 rounded-full"
                onClick={handleShowDemo}
              >
                Ver Demonstração
              </Button>
            </div>
            
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center lg:text-left">
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-plush-100 flex items-center justify-center mb-2">
                  <Calendar className="w-5 h-5 text-plush-600" />
                </div>
                <span className="text-sm text-foreground/70">Agendamento Inteligente</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-plush-100 flex items-center justify-center mb-2">
                  <MessageSquare className="w-5 h-5 text-plush-600" />
                </div>
                <span className="text-sm text-foreground/70">Comunicação com IA</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-plush-100 flex items-center justify-center mb-2">
                  <Award className="w-5 h-5 text-plush-600" />
                </div>
                <span className="text-sm text-foreground/70">Cursos & Certificados</span>
              </div>
              <div className="flex flex-col items-center lg:items-start">
                <div className="w-10 h-10 rounded-full bg-plush-100 flex items-center justify-center mb-2">
                  <PenTool className="w-5 h-5 text-plush-600" />
                </div>
                <span className="text-sm text-foreground/70">Controle de Insumos</span>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 bg-white rounded-xl shadow-xl overflow-hidden border border-plush-100">
              <div className="bg-plush-50 p-2 border-b border-plush-100">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-plush-200"></div>
                  <div className="w-3 h-3 rounded-full bg-plush-200"></div>
                  <div className="w-3 h-3 rounded-full bg-plush-200"></div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="rounded-lg overflow-hidden shadow-sm">
                  <div className="p-4 bg-plush-600 text-white">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Agenda do Dia</h3>
                      <span className="text-sm">Segunda, 19 Abril</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4">
                    <div className="space-y-4">
                      <div className="flex items-center p-3 border rounded-lg border-plush-100 bg-plush-50">
                        <div className="w-2 h-10 bg-plush-600 rounded-full mr-4"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">Ana Silva</p>
                            <span className="text-sm text-foreground/60">09:00 - 10:30</span>
                          </div>
                          <p className="text-sm text-foreground/70">Limpeza de Pele Profunda</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border rounded-lg">
                        <div className="w-2 h-10 bg-accent2-400 rounded-full mr-4"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">Mariana Costa</p>
                            <span className="text-sm text-foreground/60">11:00 - 12:00</span>
                          </div>
                          <p className="text-sm text-foreground/70">Design de Sobrancelhas</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border rounded-lg">
                        <div className="w-2 h-10 bg-plush-300 rounded-full mr-4"></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">Regina Pires</p>
                            <span className="text-sm text-foreground/60">14:00 - 15:30</span>
                          </div>
                          <p className="text-sm text-foreground/70">Massagem Relaxante</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-center">
                      <button className="text-plush-600 text-sm font-medium hover:text-plush-700">
                        Ver agenda completa →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute top-10 -right-10 bg-white rounded-lg p-3 shadow-lg border border-plush-100 animate-float hidden md:block">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Novo agendamento</p>
                  <p className="text-xs text-foreground/60">Procedimento confirmado</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-5 -left-10 bg-white rounded-lg p-3 shadow-lg border border-plush-100 animate-float hidden md:block" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-accent2-100 flex items-center justify-center">
                  <span className="text-accent2-600 text-xs">💬</span>
                </div>
                <div>
                  <p className="text-sm font-medium">IA Assistente</p>
                  <p className="text-xs text-foreground/60">Mensagem personalizada enviada</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
