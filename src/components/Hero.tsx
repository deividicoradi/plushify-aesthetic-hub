
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
            <div className="bg-card rounded-xl p-8 border border-border shadow-lg">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 font-serif text-foreground">Sistema Completo</h3>
                <p className="text-muted-foreground mb-6">
                  Uma plataforma integrada para gerenciar todos os aspectos do seu negócio de estética
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Agenda Online</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <MessageSquare className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">IA Integrada</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Cursos Online</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <PenTool className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">Gestão Completa</p>
                  </div>
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
