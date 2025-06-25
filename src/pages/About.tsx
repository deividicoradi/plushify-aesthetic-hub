
import React from 'react';
import Navbar from '../components/Navbar';
import { Users, Award, Shield, Heart, Target, Lightbulb, Sparkles, Globe, Clock } from 'lucide-react';
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

  const timeline = [
    {
      year: "2023",
      title: "Início da Jornada",
      description: "Identificamos a necessidade de modernizar a gestão de salões no Brasil"
    },
    {
      year: "2024",
      title: "Primeiro MVP",
      description: "Lançamento da primeira versão com funcionalidades essenciais"
    },
    {
      year: "2025",
      title: "Expansão Nacional",
      description: "Crescimento para centenas de estabelecimentos em todo o país"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section com gradiente */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent2-500/10 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Conheça nossa história
          </div>
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
            Sobre o Plushify
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Somos uma empresa brasileira dedicada a transformar a gestão de salões de beleza 
            e clínicas de estética através da inovação e tecnologia de ponta.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>100% Brasileiro</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Nossa História com layout moderno */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
                Nossa Jornada
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                Nossa História
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
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
            <div className="order-1 lg:order-2 relative">
              <div className="relative bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-3xl p-8 h-96 flex items-center justify-center backdrop-blur-sm border border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl"></div>
                <Users className="w-32 h-32 text-primary relative z-10" />
                <div className="absolute top-4 right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-20 h-20 bg-accent2-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
              Nossa Evolução
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Linha do Tempo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {timeline.map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-bold text-primary mb-4">{item.year}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
                {index < timeline.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nossa Missão com design renovado */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            Nossa Missão
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Nossa Missão
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed">
            Democratizar o acesso à tecnologia de gestão para profissionais de estética e beleza, 
            oferecendo ferramentas intuitivas que aumentem a produtividade e melhorem a experiência 
            dos clientes.
          </p>

          {/* Nossos Valores com cards modernos */}
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
        </div>
      </section>

      {/* Nosso Compromisso renovado */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-muted/50 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
              Nossos Compromissos
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Nosso Compromisso
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Qualidade</h3>
              <p className="text-muted-foreground leading-relaxed">
                Desenvolvemos cada funcionalidade com rigor técnico e atenção aos detalhes, 
                garantindo uma experiência de qualidade superior.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Suporte</h3>
              <p className="text-muted-foreground leading-relaxed">
                Nossa equipe de suporte está sempre disponível para ajudar nossos usuários 
                a tirarem o máximo proveito da plataforma.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Segurança</h3>
              <p className="text-muted-foreground leading-relaxed">
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
