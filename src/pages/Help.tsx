
import React from 'react';
import { HelpCircle, ExternalLink, Mail, MessageCircle, Clock, BookOpen, Video, FileText, Rss } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <header className="flex items-center gap-4 border-b bg-background px-6 py-8 mt-16">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Central de Ajuda</h1>
              <p className="text-muted-foreground">Encontre respostas e suporte para suas dúvidas</p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Support Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Suporte ao Cliente</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <p className="text-muted-foreground">Precisa de ajuda? Entre em contato com nosso suporte:</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                        <div className="p-1 bg-primary/10 rounded">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-semibold">Email:</span>
                          <a href="mailto:suporte@plushify.com" className="ml-2 text-primary hover:underline">
                            suporte@plushify.com
                          </a>
                        </div>
                      </div>
                       <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                         <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                           <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                         </div>
                         <div>
                           <span className="font-semibold">WhatsApp:</span>
                           <a 
                             href="https://wa.me/5549999150421?text=Ol%C3%A1!%20Vi%20sobre%20o%20Plushify%20e%20tenho%20interesse%20em%20conhecer%20melhor%20o%20sistema.%20Poderia%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F"
                             target="_blank"
                             rel="noopener noreferrer"
                             className="ml-2 text-green-600 dark:text-green-400 hover:underline"
                           >
                             (49) 99915-0421
                           </a>
                         </div>
                       </div>
                      <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                        <div className="p-1 bg-orange-100 dark:bg-orange-900 rounded">
                          <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <span className="font-semibold">Horário:</span>
                          <span className="ml-2 text-muted-foreground">Seg - Sex, 9h às 18h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle>Base de Conhecimento</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <p className="text-muted-foreground mb-4">Recursos para aprender e resolver dúvidas:</p>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors group" onClick={() => {
                      const element = document.getElementById('dashboard-help');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">Como usar o Dashboard</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors group" onClick={() => {
                      const element = document.getElementById('clients-help');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                          <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium">Gestão de Clientes</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors group" onClick={() => {
                      const element = document.getElementById('appointments-help');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-purple-100 dark:bg-purple-900 rounded">
                          <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="font-medium">Sistema de Agendamentos</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors group" onClick={() => {
                      const element = document.getElementById('financial-help');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-emerald-100 dark:bg-emerald-900 rounded">
                          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="font-medium">Controle Financeiro</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors group" onClick={() => {
                      const element = document.getElementById('services-help');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-orange-100 dark:bg-orange-900 rounded">
                          <BookOpen className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="font-medium">Cadastro de Serviços</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors group" onClick={() => {
                      const element = document.getElementById('inventory-help');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-red-100 dark:bg-red-900 rounded">
                          <BookOpen className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium">Gestão de Estoque</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* FAQ Section */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Perguntas Frequentes</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-border">
                    <AccordionTrigger className="hover:text-primary">
                      Como adicionar um novo cliente?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground bg-muted/30 p-4 rounded-lg border">
                      Para adicionar um novo cliente, acesse a seção "Clientes" no menu lateral, 
                      clique em "Adicionar Cliente" e preencha os campos necessários com as informações do cliente.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-border">
                    <AccordionTrigger className="hover:text-primary">
                      Como criar um novo agendamento?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground bg-muted/30 p-4 rounded-lg border">
                      Para criar um agendamento, acesse a seção "Agendamentos" no menu lateral, 
                      clique em "Novo Agendamento", selecione o cliente, o serviço, a data e o horário desejado.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-border">
                    <AccordionTrigger className="hover:text-primary">
                      Como atualizar meu plano?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground bg-muted/30 p-4 rounded-lg border">
                      Para atualizar seu plano, acesse a seção "Planos" no menu lateral, 
                      selecione o plano desejado e clique em "Assinar". Siga as instruções para 
                      concluir o pagamento e ativar seu novo plano.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-4" className="border-border">
                    <AccordionTrigger className="hover:text-primary">
                      Como usar o sistema de fidelidade?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground bg-muted/30 p-4 rounded-lg border">
                      O sistema de fidelidade está disponível no plano Premium. 
                      Acesse a seção "Fidelidade" no menu lateral para criar programas de pontos,
                      recompensas e benefícios para fidelizar seus clientes.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-5" className="border-border">
                    <AccordionTrigger className="hover:text-primary">
                      Como gerenciar meu estoque?
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground bg-muted/30 p-4 rounded-lg border">
                      No módulo "Estoque", você pode adicionar produtos, controlar quantidades,
                      definir preços e receber alertas quando os produtos estiverem acabando.
                      Ideal para manter seu salão sempre abastecido.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Guias de Ajuda Específicos */}
            <div id="dashboard-help">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle>Como usar o Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">O Dashboard é o centro de controle do Plushify onde você pode:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Ver métricas importantes do seu negócio</li>
                    <li>• Acompanhar agendamentos do dia</li>
                    <li>• Visualizar receitas e despesas</li>
                    <li>• Acessar atalhos para funcionalidades principais</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div id="clients-help">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle>Gestão de Clientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Na seção de Clientes você pode:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Cadastrar novos clientes com informações completas</li>
                    <li>• Pesquisar e filtrar clientes</li>
                    <li>• Visualizar histórico de visitas</li>
                    <li>• Editar informações dos clientes</li>
                    <li>• Acompanhar status de fidelidade</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div id="appointments-help">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle>Sistema de Agendamentos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">O sistema de agendamentos permite:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Criar novos agendamentos facilmente</li>
                    <li>• Visualizar agenda em formato calendário</li>
                    <li>• Gerenciar status dos agendamentos</li>
                    <li>• Enviar lembretes automáticos</li>
                    <li>• Controlar horários e disponibilidade</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div id="financial-help">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle>Controle Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">O módulo financeiro inclui:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Registro de pagamentos e recebimentos</li>
                    <li>• Controle de despesas do salão</li>
                    <li>• Relatórios financeiros detalhados</li>
                    <li>• Gestão de parcelas e parcelamentos</li>
                    <li>• Abertura e fechamento de caixa</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div id="services-help">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle>Cadastro de Serviços</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">Na gestão de serviços você pode:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Cadastrar todos os serviços oferecidos</li>
                    <li>• Definir preços e duração de cada serviço</li>
                    <li>• Organizar serviços por categorias</li>
                    <li>• Ativar/desativar serviços conforme necessário</li>
                    <li>• Acompanhar performance dos serviços</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div id="inventory-help">
              <Card className="border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle>Gestão de Estoque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">O controle de estoque permite:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Cadastrar produtos utilizados no salão</li>
                    <li>• Controlar quantidades em estoque</li>
                    <li>• Definir níveis mínimos de estoque</li>
                    <li>• Receber alertas de produtos em falta</li>
                    <li>• Acompanhar custos e margens de lucro</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      
      <Footer />
    </div>
  );
};

export default Help;
