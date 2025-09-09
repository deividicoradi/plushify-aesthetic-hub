import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Users, CreditCard, BarChart3, Package, Award, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Product = () => {
  const features = [
    {
      icon: Calendar,
      title: "Agendamentos Inteligentes",
      description: "Sistema completo de agendamentos com calendário interativo, lembretes automáticos por WhatsApp e e-mail, controle de disponibilidade e reagendamentos facilitados."
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastro completo de clientes com histórico de atendimentos, preferências, aniversários e acompanhamento personalizado para cada perfil."
    },
    {
      icon: CreditCard,
      title: "Controle Financeiro",
      description: "Gestão completa de pagamentos, parcelamentos, controle de caixa, relatórios financeiros detalhados e integração com métodos de pagamento digitais."
    },
    {
      icon: BarChart3,
      title: "Relatórios e Analytics",
      description: "Dashboards intuitivos com métricas de desempenho, análise de faturamento, relatórios de produtividade e insights para tomada de decisões estratégicas."
    },
    {
      icon: Package,
      title: "Controle de Estoque",
      description: "Gerenciamento completo de produtos e materiais, controle de entrada e saída, alertas de estoque baixo e relatórios de consumo."
    },
    {
      icon: Award,
      title: "Programa de Fidelidade",
      description: "Sistema de pontuação e recompensas para clientes, criação de promoções personalizadas e campanhas de marketing para aumentar a retenção."
    },
    {
      icon: FileText,
      title: "Gestão de Serviços",
      description: "Cadastro e organização de todos os serviços oferecidos, controle de preços, duração, descrições e categorização por especialidades."
    },
    {
      icon: Shield,
      title: "Segurança e Backup",
      description: "Proteção completa dos dados com backup automático, criptografia avançada e conformidade com a LGPD para garantir a segurança das informações."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center gap-4">
              <img 
                src="/lovable-uploads/1acf9e97-5636-4068-8dde-5082dbe8daca.png" 
                alt="Plushify Logo" 
                className="h-16 w-16 object-contain"
                style={{ background: 'transparent', opacity: 1 }}
              />
              <span className="text-3xl font-bold text-foreground">Plushify</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Conheça o <span className="text-primary">Plushify</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Uma plataforma completa desenvolvida especialmente para profissionais de estética, 
            salões de beleza e clínicas que desejam modernizar e otimizar sua gestão.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubra como o Plushify pode transformar a gestão do seu negócio com 
              ferramentas pensadas especificamente para o seu segmento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher o Plushify?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Segurança Garantida</h3>
              <p className="text-muted-foreground">
                Seus dados protegidos com criptografia avançada e conformidade total com a LGPD brasileira.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Aumento da Produtividade</h3>
              <p className="text-muted-foreground">
                Automatize processos repetitivos e foque no que realmente importa: seus clientes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Fidelização de Clientes</h3>
              <p className="text-muted-foreground">
                Programa de pontos e recompensas que mantém seus clientes sempre voltando.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Product;
