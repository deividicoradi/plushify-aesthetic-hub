
import React from 'react';
import { Heart, Shield, Target, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AboutValues = () => {
  const values = [
    {
      icon: Heart,
      title: "Paixão pela Excelência",
      description: "Desenvolvemos cada funcionalidade com dedicação, buscando sempre superar as expectativas dos nossos usuários e oferecer soluções que realmente fazem a diferença."
    },
    {
      icon: Shield,
      title: "Segurança e Confiança",
      description: "Protegemos os dados dos nossos clientes com os mais rigorosos padrões de segurança digital, garantindo total conformidade com a LGPD e melhores práticas do mercado."
    },
    {
      icon: Target,
      title: "Resultados Reais",
      description: "Nosso foco está em entregar resultados mensuráveis que impactem positivamente o crescimento e a eficiência dos negócios dos nossos parceiros."
    },
    {
      icon: Lightbulb,
      title: "Inovação Inteligente",
      description: "Utilizamos tecnologia de ponta para criar soluções intuitivas que simplificam processos complexos e maximizam a produtividade dos profissionais."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {values.map((value, index) => (
        <Card key={index} className="border-0 bg-gradient-to-br from-background to-muted/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
              <value.icon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground text-center">
              {value.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-muted-foreground leading-relaxed text-center">
              {value.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AboutValues;
