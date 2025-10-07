
import React from 'react';
import { ArrowRight, Calendar, MessageSquare, Award, PenTool, Users, BarChart3, Box, Star, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

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
    <section className="relative pt-28 pb-20 overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Background decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full filter blur-3xl opacity-60 -z-10 animate-pulse-soft"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-tr from-accent/30 to-primary/20 rounded-full filter blur-3xl opacity-60 -z-10 animate-float"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full filter blur-2xl opacity-40 -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-2 mb-8 rounded-full bg-gradient-to-r from-primary/15 to-accent/15 border border-primary/30 text-primary text-sm font-medium shadow-lg backdrop-blur-sm">
              <Sparkles className="w-4 h-4 animate-pulse" />
              ✨ Software completo para profissionais de estética
              <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5">NOVO</Badge>
            </div>

            {/* Enhanced Title */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-8 font-serif leading-tight">
              <span className="block text-foreground mb-2">Sua estética,</span>
              <span className="gradient-text bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                seu sucesso
              </span>
            </h1>

            {/* Enhanced Description */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Gerencie <span className="font-semibold text-primary">agendamentos</span>, 
              <span className="font-semibold text-primary"> clientes</span>, 
              <span className="font-semibold text-primary"> estoque</span> e 
              <span className="font-semibold text-primary"> WhatsApp</span> com o sistema mais completo do mercado.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex justify-center lg:justify-start mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground h-14 px-10 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-lg font-semibold"
                onClick={handleStartFree}
              >
                <Sparkles className="mr-3 w-5 h-5" />
                Começar Grátis Agora
                <ArrowRight className="ml-3 w-5 h-5" />
              </Button>
            </div>
            
            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-12">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face" 
                    alt="Profissional da beleza" 
                    className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-md"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=32&h=32&fit=crop&crop=face" 
                    alt="Profissional da beleza" 
                    className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-md"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=32&h=32&fit=crop&crop=face" 
                    alt="Profissional da beleza" 
                    className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-md"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=32&h=32&fit=crop&crop=face" 
                    alt="Profissional da beleza" 
                    className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-md"
                  />
                  <img 
                    src="https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=32&h=32&fit=crop&crop=face" 
                    alt="Profissional da beleza" 
                    className="w-8 h-8 rounded-full border-2 border-background object-cover shadow-md"
                  />
                </div>
                <span className="text-sm text-muted-foreground">+1.200 profissionais</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-sm text-muted-foreground ml-2">4.9/5 avaliação</span>
              </div>
            </div>
            
            {/* Feature Icons Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Calendar, label: "Agenda Inteligente", color: "text-blue-500" },
                { icon: Users, label: "Gestão de Clientes", color: "text-green-500" },
                { icon: BarChart3, label: "Relatórios Avançados", color: "text-purple-500" },
                { icon: Star, label: "Programa Fidelidade", color: "text-yellow-500" }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center lg:items-start group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground text-center lg:text-left">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Enhanced Right Side */}
          <div className="relative">
            {/* Main Card */}
            <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-8 border border-border/50 shadow-2xl backdrop-blur-sm relative z-10">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">Sistema Ativo</span>
                </div>
                
                <h3 className="text-3xl font-bold mb-4 font-serif text-foreground">Dashboard Completo</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Controle total do seu negócio em uma interface moderna e intuitiva
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">+150%</p>
                    <p className="text-sm text-green-700 dark:text-green-300">Faturamento</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">1.2k+</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Clientes</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">98%</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Taxa de Sucesso</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">24/7</p>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Suporte</p>
                  </div>
                </div>

                <Button 
                  onClick={handleStartFree}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground h-12 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Experimente Grátis por 3 dias
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full opacity-60 animate-float"></div>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-tr from-accent/20 to-primary/20 rounded-full opacity-40 animate-pulse-soft"></div>
            
            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-grid-white/10 dark:bg-grid-purple-500/10 -z-10 rounded-2xl"></div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground mb-8 text-lg">Confiado por milhares de profissionais em todo o Brasil</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília", "Salvador"].map((city, index) => (
              <div key={index} className="px-6 py-3 bg-muted/50 rounded-lg border text-muted-foreground font-medium">
                {city}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
