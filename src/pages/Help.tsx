
import React from 'react';
import { HelpCircle, ExternalLink, Mail, MessageCircle, Clock, BookOpen, Video, FileText, Rss } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import DashboardSidebar from '@/components/layout/DashboardSidebar';

const Help = () => {
  return (
    <div className="flex min-h-screen w-full">
      <DashboardSidebar />
      <div className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
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
          
          <div className="max-w-4xl mx-auto space-y-6">
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
                          <span className="ml-2 text-muted-foreground">(00) 0000-0000</span>
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
                    <a href="#" className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                          <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="font-medium">Guia de Introdução</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-red-100 dark:bg-red-900 rounded">
                          <Video className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium">Tutoriais em Vídeo</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium">FAQs</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 bg-card rounded-lg border hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-orange-100 dark:bg-orange-900 rounded">
                          <Rss className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="font-medium">Blog</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
