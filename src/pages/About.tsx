
import React from 'react';
import Navbar from '../components/Navbar';
import { Users, Award, Shield, Heart, Target, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Paixão pelo que fazemos",
      description: "Acreditamos que a tecnologia deve facilitar a vida dos profissionais de estética e beleza, permitindo que foquem no que realmente importa: cuidar dos seus clientes."
    },
    {
      icon: Shield,
      title: "Segurança e Confiabilidade",
      description: "Desenvolvemos nossa plataforma com os mais altos padrões de segurança, garantindo que os dados dos nossos usuários estejam sempre protegidos."
    },
    {
      icon: Target,
      title: "Foco no Cliente",
      description: "Cada funcionalidade é pensada para resolver problemas reais dos nossos usuários, baseada em feedback direto e necessidades do mercado."
    },
    {
      icon: Lightbulb,
      title: "Inovação Constante",
      description: "Estamos sempre buscando novas formas de melhorar a experiência dos nossos usuários através de tecnologia de ponta."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Sobre o <span className="text-primary">Plushify</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Somos uma empresa brasileira dedicada a transformar a gestão de salões de beleza 
            e clínicas de estética através da tecnologia.
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Nossa História
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  O Plushify nasceu da necessidade real observada no mercado de estética e beleza brasileiro. 
                  Percebemos que muitos profissionais ainda dependiam de métodos manuais e sistemas 
                  desatualizados para gerenciar seus negócios.
                </p>
                <p>
                  Nossa equipe, formada por desenvolvedores e especialistas em negócios, decidiu criar 
                  uma solução completa que pudesse atender desde pequenos salões até grandes clínicas, 
                  sempre com foco na simplicidade e eficiência.
                </p>
                <p>
                  Hoje, orgulhosamente brasileiro, o Plushify atende centenas de estabelecimentos 
                  em todo o país, ajudando empreendedores a digitalizarem e otimizarem seus processos.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-primary/10 rounded-2xl p-8 h-96 flex items-center justify-center">
                <Users className="w-32 h-32 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa Missão */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Nossa Missão
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-16">
            Democratizar o acesso à tecnologia de gestão para profissionais de estética e beleza, 
            oferecendo ferramentas intuitivas que aumentem a produtividade e melhorem a experiência 
            dos clientes.
          </p>

          {/* Nossos Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <value.icon className="w-6 h-6 text-primary" />
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
        </div>
      </section>

      {/* Nosso Compromisso */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nosso Compromisso
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Qualidade</h3>
              <p className="text-muted-foreground">
                Desenvolvemos cada funcionalidade com rigor técnico e atenção aos detalhes, 
                garantindo uma experiência de qualidade superior.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Suporte</h3>
              <p className="text-muted-foreground">
                Nossa equipe de suporte está sempre disponível para ajudar nossos usuários 
                a tirarem o máximo proveito da plataforma.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Segurança</h3>
              <p className="text-muted-foreground">
                Cumprimos rigorosamente a LGPD e utilizamos as melhores práticas de segurança 
                para proteger os dados dos nossos usuários.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
