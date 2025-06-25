
import React from 'react';
import Navbar from '../components/Navbar';
import { Users, Award, Shield, Heart, Target, Lightbulb, Sparkles, Globe, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
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
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed">
            Somos a plataforma líder em gestão digital para salões de beleza e clínicas de estética no Brasil. 
            Nossa missão é capacitar empreendedores do setor a alcançarem novos patamares de sucesso através da tecnologia.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>Orgulhosamente Brasileiro</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>Suporte Especializado</span>
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
                Nossa Origem
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
                Como Tudo Começou
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  O Plushify nasceu da observação de uma lacuna real no mercado brasileiro de beleza e estética. 
                  Percebemos que profissionais talentosos estavam limitados por ferramentas obsoletas e processos 
                  manuais que consumiam tempo precioso que poderia ser dedicado ao que realmente importa: seus clientes.
                </p>
                <p>
                  Nossa equipe multidisciplinar, composta por desenvolvedores experientes, designers especializados 
                  em UX e consultores de negócios do setor de beleza, uniu forças para criar uma solução verdadeiramente 
                  transformadora. Não queríamos apenas mais um software, mas sim uma plataforma que revolucionasse 
                  a forma como o setor opera.
                </p>
                <p>
                  Hoje, o Plushify é reconhecido como a solução mais completa e confiável do mercado, atendendo 
                  desde profissionais autônomos até grandes redes de franquias, sempre mantendo nosso compromisso 
                  com a qualidade, inovação e suporte excepcional.
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

      {/* Nossa Missão com design renovado */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-6">
            Nossa Proposta de Valor
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8">
            Nossa Missão
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed">
            Transformar a gestão de salões e clínicas através de tecnologia inteligente e acessível, 
            capacitando empreendedores a focar no que fazem de melhor: criar experiências excepcionais 
            para seus clientes e fazer seus negócios prosperarem.
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
              Nossos Diferenciais
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              O Que Nos Move
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Excelência Técnica</h3>
              <p className="text-muted-foreground leading-relaxed">
                Desenvolvemos cada linha de código com precisão e rigor técnico, garantindo 
                uma plataforma robusta, confiável e sempre atualizada com as últimas 
                tendências tecnológicas do mercado.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Parceria Verdadeira</h3>
              <p className="text-muted-foreground leading-relaxed">
                Não somos apenas um fornecedor de software, somos parceiros no seu sucesso. 
                Nossa equipe especializada oferece suporte contínuo, treinamentos personalizados 
                e consultoria estratégica para maximizar seus resultados.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent2-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Segurança Total</h3>
              <p className="text-muted-foreground leading-relaxed">
                Seus dados e os de seus clientes estão protegidos pelos mais altos padrões 
                de segurança digital. Somos 100% compatíveis com a LGPD e utilizamos 
                criptografia de ponta para garantir a privacidade e integridade das informações.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
