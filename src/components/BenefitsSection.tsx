
import React from 'react';
import { TrendingUp, Clock, Shield, Sparkles, Users, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const BenefitsSection = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Aumento de 150% no Faturamento",
      description: "Nossos clientes reportam um aumento médio de 150% no faturamento após 3 meses de uso",
      stat: "+150%",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Clock,
      title: "Economize 15h por Semana",
      description: "Automatize tarefas repetitivas e foque no que realmente importa: seus clientes",
      stat: "15h/sem",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: Users,
      title: "98% de Satisfação dos Clientes",
      description: "Melhore a experiência dos seus clientes com lembretes automáticos e atendimento personalizado",
      stat: "98%",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      icon: Shield,
      title: "100% Seguro e Confiável",
      description: "Seus dados estão seguros com criptografia de ponta e backups automáticos",
      stat: "100%",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Resultados Comprovados
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-serif text-foreground">
            Por que escolher o <span className="gradient-text">Plushify</span>?
          </h2>
          <p className="text-xl text-muted-foreground">
            Mais de 10.000 profissionais já transformaram seus negócios com nossa plataforma. 
            Veja os resultados que você pode alcançar.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl ${benefit.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  
                  <div className={`text-3xl font-bold mb-3 ${benefit.color}`}>
                    {benefit.stat}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3 text-foreground">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-card to-muted/30 border-primary/20">
            <CardContent className="p-10">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Pronto para transformar seu negócio?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Junte-se aos milhares de profissionais que já descobriram o poder do Plushify
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-green-500" />
                  7 dias grátis
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-blue-500" />
                  Sem compromisso
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="w-4 h-4 text-purple-500" />
                  Resultados garantidos
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
