
import React from 'react';
import { Users, Target, Award, Heart } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-plush-50 to-purple-50 dark:from-plush-900 dark:to-purple-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Sobre a <span className="gradient-text">Plushify</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Revolucionando a gestão de negócios de estética com tecnologia inteligente e design centrado no usuário.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Nossa Missão</h2>
            <p className="text-lg text-foreground/80 mb-6">
              Capacitar profissionais de estética com ferramentas tecnológicas avançadas que simplificam a gestão do negócio, 
              permitindo que foquem no que realmente importa: cuidar dos seus clientes.
            </p>
            <p className="text-lg text-foreground/80">
              Acreditamos que toda esteticista merece ter acesso à tecnologia de ponta para fazer seu negócio prosperar, 
              independentemente do tamanho ou estágio do empreendimento.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/fb688682-304d-4260-8d0f-1e0b9ca400fe.png" 
              alt="Equipe Plushify" 
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 card-hover">
            <CardContent className="pt-6">
              <Target className="w-12 h-12 text-plush-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Foco no Cliente</h3>
              <p className="text-foreground/70">
                Desenvolvemos soluções pensando primeiro na experiência do usuário e nas necessidades reais dos profissionais.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 card-hover">
            <CardContent className="pt-6">
              <Award className="w-12 h-12 text-plush-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Excelência</h3>
              <p className="text-foreground/70">
                Buscamos constantemente a perfeição em cada funcionalidade, garantindo qualidade e confiabilidade.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 card-hover">
            <CardContent className="pt-6">
              <Heart className="w-12 h-12 text-plush-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Paixão</h3>
              <p className="text-foreground/70">
                Amamos o que fazemos e isso se reflete no cuidado com cada detalhe da nossa plataforma.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">Nossa Equipe</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: "Ana Silva", role: "CEO & Fundadora", expertise: "Gestão e Visão Estratégica" },
              { name: "Carlos Santos", role: "CTO", expertise: "Tecnologia e Inovação" },
              { name: "Maria Oliveira", role: "Head de Produto", expertise: "UX/UI e Experiência do Cliente" },
              { name: "João Costa", role: "Head de Marketing", expertise: "Growth e Relacionamento" }
            ].map((member, index) => (
              <Card key={index} className="text-center p-4 card-hover">
                <CardContent className="pt-4">
                  <div className="w-20 h-20 bg-plush-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-plush-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-1">{member.name}</h4>
                  <p className="text-plush-600 mb-2">{member.role}</p>
                  <p className="text-sm text-foreground/70">{member.expertise}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
