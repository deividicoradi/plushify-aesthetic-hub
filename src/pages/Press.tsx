
import React from 'react';
import { Download, ExternalLink, Calendar, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Press = () => {
  const pressReleases = [
    {
      id: 1,
      title: "Plushify Levanta R$ 5 Milhões em Rodada Seed",
      date: "15 de Janeiro, 2024",
      category: "Investimento",
      excerpt: "Startup que revoluciona a gestão de negócios de estética recebe aporte para expansão nacional.",
      downloadUrl: "#"
    },
    {
      id: 2,
      title: "Plushify Alcança 10.000 Usuários Ativos",
      date: "3 de Janeiro, 2024",
      category: "Milestone",
      excerpt: "Plataforma cresce 300% no último ano e se consolida como líder no setor de gestão para estética.",
      downloadUrl: "#"
    },
    {
      id: 3,
      title: "Nova Funcionalidade de IA Lançada",
      date: "20 de Dezembro, 2023",
      category: "Produto",
      excerpt: "Inteligência artificial agora ajuda profissionais a otimizar agendamentos e aumentar faturamento.",
      downloadUrl: "#"
    }
  ];

  const awards = [
    {
      title: "Startup do Ano 2023",
      organization: "Beauty Tech Awards",
      year: "2023"
    },
    {
      title: "Melhor Solução em SaaS",
      organization: "TechCrunch Disrupt",
      year: "2023"
    },
    {
      title: "Inovação em HealthTech",
      organization: "HealthTech Summit",
      year: "2022"
    }
  ];

  const mediaKit = [
    { name: "Logo Plushify (PNG)", size: "2.5 MB", type: "Imagem" },
    { name: "Logo Plushify (SVG)", size: "1.2 MB", type: "Vetor" },
    { name: "Screenshots da Plataforma", size: "15 MB", type: "Imagens" },
    { name: "Fact Sheet 2024", size: "500 KB", type: "PDF" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-plush-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Imprensa <span className="gradient-text">Plushify</span>
          </h1>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Recursos e informações para jornalistas, analistas e parceiros de mídia.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-8">Comunicados de Imprensa</h2>
            <div className="space-y-6">
              {pressReleases.map((release) => (
                <Card key={release.id} className="card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge className="bg-plush-100 text-plush-700" variant="secondary">
                            {release.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-foreground/60">
                            <Calendar className="w-4 h-4" />
                            <span>{release.date}</span>
                          </div>
                        </div>
                        <CardTitle className="text-xl mb-3">{release.title}</CardTitle>
                        <p className="text-foreground/70">{release.excerpt}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-plush-600" />
                  Prêmios e Reconhecimentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {awards.map((award, index) => (
                    <div key={index} className="border-l-4 border-plush-200 pl-4">
                      <h4 className="font-semibold">{award.title}</h4>
                      <p className="text-sm text-foreground/70">{award.organization}</p>
                      <p className="text-xs text-plush-600 font-medium">{award.year}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kit de Mídia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mediaKit.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-foreground/60">{item.type} • {item.size}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-plush-600 hover:bg-plush-700">
                  Download Kit Completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-4">Contato para Imprensa</h3>
            <p className="text-foreground/70 mb-6">
              Para entrevistas, informações adicionais ou recursos de mídia, entre em contato:
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div>
                <h4 className="font-semibold mb-2">Assessoria de Imprensa</h4>
                <p className="text-foreground/70">imprensa@plushify.com</p>
                <p className="text-foreground/70">(11) 9999-9999</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Parcerias e Colaborações</h4>
                <p className="text-foreground/70">parcerias@plushify.com</p>
                <p className="text-foreground/70">(11) 8888-8888</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Press;
