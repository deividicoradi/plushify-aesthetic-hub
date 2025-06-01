
import React from 'react';
import { Handshake, Target, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Partners = () => {
  const partnerTypes = [
    {
      title: "Integradores de Tecnologia",
      description: "Empresas que desenvolvem integrações e soluções complementares",
      icon: Target,
      benefits: ["API completa", "Suporte técnico dedicado", "Documentação avançada"],
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: "Revendedores",
      description: "Parceiros comerciais que vendem nossa solução para seus clientes",
      icon: Users,
      benefits: ["Comissões atrativas", "Material de vendas", "Treinamento completo"],
      color: "bg-green-100 text-green-700"
    },
    {
      title: "Consultores",
      description: "Especialistas que implementam e consultam clientes na nossa plataforma",
      icon: TrendingUp,
      benefits: ["Certificação oficial", "Leads qualificados", "Suporte prioritário"],
      color: "bg-purple-100 text-purple-700"
    }
  ];

  const currentPartners = [
    { name: "BeautyTech Solutions", category: "Integrador", logo: "🔧" },
    { name: "SalonPro Consulting", category: "Consultor", logo: "💼" },
    { name: "EstheticHub", category: "Revendedor", logo: "🏪" },
    { name: "TechBeauty Brasil", category: "Integrador", logo: "⚡" },
    { name: "Beauty Business Expert", category: "Consultor", logo: "🎯" },
    { name: "SkinCare Solutions", category: "Revendedor", logo: "✨" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-plush-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Parceiros <span className="gradient-text">Plushify</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Junte-se ao nosso ecossistema de parceiros e cresça conosco no mercado de tecnologia para estética.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {partnerTypes.map((type, index) => (
            <Card key={index} className="card-hover">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${type.color} flex items-center justify-center mb-4`}>
                  <type.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{type.title}</CardTitle>
                <p className="text-foreground/70">{type.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {type.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-plush-600 hover:bg-plush-700">
                  Tornar-se Parceiro
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Parceiros Atuais</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPartners.map((partner, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{partner.logo}</div>
                    <div>
                      <h3 className="font-semibold">{partner.name}</h3>
                      <Badge variant="secondary" className="bg-plush-100 text-plush-700">
                        {partner.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Benefícios de ser Parceiro Plushify</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Receita Recorrente", description: "Modelo de negócio sustentável com comissões mensais" },
                { title: "Suporte Completo", description: "Equipe dedicada para apoiar seus clientes" },
                { title: "Material de Marketing", description: "Recursos prontos para suas campanhas" },
                { title: "Treinamento Contínuo", description: "Capacitação constante em novas funcionalidades" }
              ].map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-plush-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Handshake className="w-8 h-8 text-plush-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-foreground/70">{benefit.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="text-center p-8 bg-gradient-to-r from-plush-600 to-purple-600 text-white">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-4">Pronto para se Tornar um Parceiro?</h3>
            <p className="mb-6 opacity-90">
              Preencha nosso formulário e nossa equipe entrará em contato em até 24 horas para discutir as oportunidades.
            </p>
            <Button size="lg" variant="secondary" className="bg-white text-plush-600 hover:bg-gray-50">
              Quero ser Parceiro <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Partners;
