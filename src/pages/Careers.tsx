
import React from 'react';
import { MapPin, Clock, Users, Briefcase, Heart, Code, Palette, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Careers = () => {
  const openPositions = [
    {
      id: 1,
      title: "Desenvolvedor Frontend React",
      department: "Tecnologia",
      location: "São Paulo/SP",
      type: "Tempo Integral",
      level: "Pleno",
      description: "Buscamos um desenvolvedor React apaixonado por criar interfaces incríveis para nossa plataforma.",
      requirements: ["React.js", "TypeScript", "Tailwind CSS", "3+ anos de experiência"]
    },
    {
      id: 2,
      title: "Designer UX/UI",
      department: "Design",
      location: "Remoto",
      type: "Tempo Integral",
      level: "Sênior",
      description: "Procuramos um designer para criar experiências memoráveis e centradas no usuário.",
      requirements: ["Figma", "Design Systems", "Prototipagem", "5+ anos de experiência"]
    },
    {
      id: 3,
      title: "Especialista em Marketing Digital",
      department: "Marketing",
      location: "Rio de Janeiro/RJ",
      type: "Tempo Integral",
      level: "Pleno",
      description: "Venha fazer parte da equipe que conecta nossa solução com profissionais de estética.",
      requirements: ["Google Ads", "Meta Ads", "SEO", "Analytics", "2+ anos de experiência"]
    }
  ];

  const benefits = [
    { icon: Heart, title: "Plano de Saúde", description: "Cobertura completa para você e sua família" },
    { icon: Code, title: "Equipamentos", description: "MacBook e setup completo para trabalhar" },
    { icon: TrendingUp, title: "Crescimento", description: "Plano de carreira e desenvolvimento contínuo" },
    { icon: Users, title: "Equipe", description: "Time colaborativo e ambiente inclusivo" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-plush-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Carreiras na <span className="gradient-text">Plushify</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Junte-se a nós na missão de transformar o mercado de estética com tecnologia inovadora.
            Aqui, seu talento tem espaço para crescer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center p-6 card-hover">
              <CardContent className="pt-6">
                <benefit.icon className="w-12 h-12 text-plush-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-foreground/70 text-sm">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Vagas Abertas</h2>
          <div className="grid gap-6">
            {openPositions.map((position) => (
              <Card key={position.id} className="card-hover">
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl mb-2">{position.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{position.department}</Badge>
                        <Badge variant="outline">{position.level}</Badge>
                        <Badge className="bg-plush-100 text-plush-700">{position.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-foreground/60">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{position.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          <span>{position.department}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-plush-600 hover:bg-plush-700 whitespace-nowrap">
                      Candidatar-se
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80 mb-4">{position.description}</p>
                  <div>
                    <h4 className="font-semibold mb-2">Requisitos:</h4>
                    <div className="flex flex-wrap gap-2">
                      {position.requirements.map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-8">
            <CardContent className="pt-6">
              <h3 className="text-2xl font-bold mb-4">Não encontrou a vaga ideal?</h3>
              <p className="text-foreground/70 mb-6">
                Estamos sempre em busca de talentos excepcionais. Envie seu currículo e 
                entraremos em contato quando surgir uma oportunidade que combine com seu perfil.
              </p>
              <Button size="lg" className="bg-plush-600 hover:bg-plush-700">
                Enviar Currículo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Careers;
