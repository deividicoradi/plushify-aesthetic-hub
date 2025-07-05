import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Heart, Zap, Award } from 'lucide-react';

const openPositions = [
  {
    id: 1,
    title: "Desenvolvedor Frontend React",
    department: "Tecnologia",
    location: "São Paulo, SP",
    type: "CLT",
    level: "Pleno",
    description: "Buscamos um desenvolvedor React experiente para trabalhar em nossa plataforma de gestão para salões."
  },
  {
    id: 2,
    title: "Designer UX/UI",
    department: "Design",
    location: "Remote",
    type: "CLT",
    level: "Pleno",
    description: "Procuramos um designer para criar experiências incríveis para nossos usuários."
  },
  {
    id: 3,
    title: "Analista de Marketing Digital",
    department: "Marketing",
    location: "São Paulo, SP",
    type: "CLT",
    level: "Júnior",
    description: "Oportunidade para trabalhar com marketing digital em uma startup em crescimento."
  }
];

const benefits = [
  {
    icon: Heart,
    title: "Plano de Saúde",
    description: "Plano de saúde completo para você e sua família"
  },
  {
    icon: Zap,
    title: "Home Office",
    description: "Flexibilidade para trabalhar de casa quando necessário"
  },
  {
    icon: Award,
    title: "Crescimento",
    description: "Programa de desenvolvimento e crescimento profissional"
  },
  {
    icon: Users,
    title: "Time Incrível",
    description: "Trabalhe com pessoas talentosas e apaixonadas"
  }
];

const Careers = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Carreiras na Plushify
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Junte-se a nós para revolucionar o mercado de beleza e estética
            </p>
            <Button size="lg">
              Ver Vagas Abertas
            </Button>
          </div>
        </div>
      </div>

      {/* Company Culture */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Por que trabalhar na Plushify?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Somos uma empresa que valoriza inovação, crescimento e bem-estar dos nossos colaboradores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Vagas Abertas
          </h2>
          
          <div className="space-y-6">
            {openPositions.map((position) => (
              <Card key={position.id}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-xl mb-2">{position.title}</CardTitle>
                      <CardDescription className="mb-4">
                        {position.description}
                      </CardDescription>
                    </div>
                    <Button>
                      Candidatar-se
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {position.department}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {position.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {position.type}
                    </div>
                    <Badge variant="secondary">{position.level}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No positions available fallback */}
          {openPositions.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-xl font-semibold mb-4">
                  Não há vagas abertas no momento
                </h3>
                <p className="text-muted-foreground mb-6">
                  Mas fique atento! Novas oportunidades surgem constantemente.
                </p>
                <Button variant="outline">
                  Cadastrar Currículo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Careers;