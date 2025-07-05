import React from 'react';
import { Calendar, Star, Zap, Bug, Shield, Sparkles, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Updates = () => {
  const updates = [
    {
      version: "3.2.0",
      date: "2025-01-05",
      type: "major",
      title: "Nova Dashboard Financeira",
      description: "Interface completamente redesenhada para gestão financeira com gráficos interativos e relatórios avançados.",
      features: [
        "Dashboard financeira com gráficos em tempo real",
        "Controle de abertura e fechamento de caixa",
        "Relatórios de receitas e despesas",
        "Análise de performance por período"
      ],
      improvements: [
        "Performance 40% mais rápida no carregamento",
        "Interface mais intuitiva e moderna"
      ]
    },
    {
      version: "3.1.5",
      date: "2024-12-20",
      type: "minor",
      title: "Melhorias de Segurança e Performance",
      description: "Atualizações importantes de segurança e otimizações de performance.",
      features: [],
      improvements: [
        "Autenticação de dois fatores aprimorada",
        "Criptografia end-to-end para dados sensíveis",
        "Cache inteligente reduzindo tempo de carregamento",
        "Backup automático diário"
      ],
      fixes: [
        "Corrigido problema de sincronização em agendamentos",
        "Resolvido bug na exportação de relatórios"
      ]
    },
    {
      version: "3.1.0",
      date: "2024-12-01",
      type: "major",
      title: "Sistema de Fidelidade",
      description: "Novo módulo completo para programas de fidelidade e recompensas para clientes.",
      features: [
        "Programa de pontos personalizável",
        "Sistema de recompensas e desafios",
        "Rankings de clientes mais fiéis",
        "Cupons e promoções automáticas"
      ],
      improvements: [
        "Nova seção no menu principal",
        "Integração com sistema de pagamentos"
      ]
    },
    {
      version: "3.0.8",
      date: "2024-11-15",
      type: "patch",
      title: "Correções e Melhorias",
      description: "Correções importantes e pequenas melhorias baseadas no feedback dos usuários.",
      features: [],
      improvements: [
        "Melhor responsividade em dispositivos móveis",
        "Otimização do sistema de notificações",
        "Interface mais acessível"
      ],
      fixes: [
        "Corrigido erro ao editar perfil de cliente",
        "Resolvido problema de timezone em agendamentos",
        "Corrigido bug na impressão de recibos"
      ]
    }
  ];

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'major': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'minor': return <Zap className="w-5 h-5 text-blue-500" />;
      case 'patch': return <Bug className="w-5 h-5 text-green-500" />;
      default: return <CheckCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getUpdateBadge = (type: string) => {
    switch (type) {
      case 'major': return <Badge className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20">Atualização Principal</Badge>;
      case 'minor': return <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20">Melhorias</Badge>;
      case 'patch': return <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/20">Correções</Badge>;
      default: return <Badge>Atualização</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            <Sparkles className="w-4 h-4 mr-2" />
            Sempre Atualizando
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
            Atualizações
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Acompanhe todas as novidades, melhorias e correções da plataforma Plushify. 
            Estamos sempre evoluindo para oferecer a melhor experiência para seu negócio.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Última atualização: 05 de Janeiro, 2025
          </div>
        </div>
      </section>

      {/* Updates Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {updates.map((update, index) => (
              <Card key={update.version} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getUpdateIcon(update.type)}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-2xl">v{update.version}</CardTitle>
                          {getUpdateBadge(update.type)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {new Date(update.date).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-xl font-semibold mb-2">{update.title}</h3>
                    <CardDescription className="text-base">
                      {update.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    {update.features && update.features.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-3 flex items-center">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Novas Funcionalidades
                        </h4>
                        <ul className="space-y-2">
                          {update.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {update.improvements && update.improvements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-3 flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          Melhorias
                        </h4>
                        <ul className="space-y-2">
                          {update.improvements.map((improvement, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {update.fixes && update.fixes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-3 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Correções
                        </h4>
                        <ul className="space-y-2">
                          {update.fixes.map((fix, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{fix}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                {index < updates.length - 1 && (
                  <div className="absolute left-6 -bottom-4 w-0.5 h-8 bg-border"></div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Fique por dentro das novidades
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Receba notificações sobre novas atualizações diretamente no seu painel da Plushify
          </p>
          
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-4 text-primary">
                <Sparkles className="w-6 h-6" />
                <span className="font-semibold">
                  Notificações automáticas já ativadas no seu painel!
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Updates;