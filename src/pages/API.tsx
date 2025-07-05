import React from 'react';
import { Code2, Terminal, FileText, Key, Globe, Shield, Zap, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-muted/30">
        <div className="max-w-6xl mx-auto text-center">
          <Badge className="mb-6 bg-primary/10 text-primary hover:bg-primary/20">
            <Code2 className="w-4 h-4 mr-2" />
            API RESTful
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-6">
            API Plushify
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Integre o poder da Plushify em suas aplicações. Nossa API RESTful oferece acesso completo 
            aos recursos da plataforma com documentação detalhada e SDKs prontos para uso.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <BookOpen className="w-5 h-5 mr-2" />
              Ver Documentação
            </Button>
            <Button size="lg" variant="outline">
              <Key className="w-5 h-5 mr-2" />
              Gerar API Key
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Recursos da API</h2>
            <p className="text-xl text-muted-foreground">
              Acesse todos os recursos da Plushify programaticamente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Terminal className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Endpoints Completos</CardTitle>
                <CardDescription>
                  Acesse clientes, agendamentos, serviços, pagamentos e relatórios via API
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Autenticação Segura</CardTitle>
                <CardDescription>
                  OAuth 2.0 e API Keys com controle granular de permissões
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Rate Limiting</CardTitle>
                <CardDescription>
                  Até 1000 requisições por minuto com cache inteligente
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Documentação Interativa</CardTitle>
                <CardDescription>
                  Swagger UI com exemplos de código em múltiplas linguagens
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Webhooks</CardTitle>
                <CardDescription>
                  Receba notificações em tempo real sobre eventos importantes
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>SDKs Oficiais</CardTitle>
                <CardDescription>
                  Bibliotecas prontas para JavaScript, PHP, Python e C#
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Exemplo de Uso</h2>
            <p className="text-xl text-muted-foreground">
              Veja como é simples integrar com nossa API
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                Listar Agendamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="text-gray-400">// JavaScript</div>
                <div className="mt-2">
                  <span className="text-blue-400">const</span> response = <span className="text-blue-400">await</span> <span className="text-yellow-400">fetch</span>(<span className="text-green-300">'https://api.plushify.com.br/v1/appointments'</span>, {'{'}
                </div>
                <div className="ml-4">
                  headers: {'{'}
                </div>
                <div className="ml-8">
                  <span className="text-green-300">'Authorization'</span>: <span className="text-green-300">'Bearer YOUR_API_KEY'</span>,
                </div>
                <div className="ml-8">
                  <span className="text-green-300">'Content-Type'</span>: <span className="text-green-300">'application/json'</span>
                </div>
                <div className="ml-4">{'}'}</div>
                <div>{'}'});</div>
                <div className="mt-2">
                  <span className="text-blue-400">const</span> appointments = <span className="text-blue-400">await</span> response.<span className="text-yellow-400">json</span>();
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Acesse nossa documentação completa e comece a integrar hoje mesmo
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <BookOpen className="w-5 h-5 mr-2" />
              Documentação da API
            </Button>
            <Button size="lg" variant="outline">
              <Key className="w-5 h-5 mr-2" />
              Obter API Key
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default API;