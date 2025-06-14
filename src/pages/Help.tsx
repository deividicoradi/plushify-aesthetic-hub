
import React from 'react';
import { HelpCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Help = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col min-h-screen w-full">
            {/* Header with sidebar trigger */}
            <header className="flex items-center gap-4 border-b border-border bg-background px-4 py-2">
              <SidebarTrigger />
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">Ajuda</h1>
              </div>
            </header>

            {/* Main content */}
            <main className="flex-1 p-8 bg-background dark:bg-background">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-6 h-6 text-primary" />
                  <h1 className="text-2xl font-bold">Ajuda</h1>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-primary">Suporte ao Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground">Precisa de ajuda? Entre em contato com nosso suporte:</p>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Email:</span>
                            <a href="mailto:suporte@plushify.com" className="text-primary hover:underline">
                              suporte@plushify.com
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">WhatsApp:</span>
                            <span className="text-muted-foreground">(00) 0000-0000</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">Horário:</span>
                            <span className="text-muted-foreground">Seg - Sex, 9h às 18h</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Base de Conhecimento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                          <span>Guia de Introdução</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                          <span>Tutoriais em Vídeo</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                          <span>FAQs</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <a href="#" className="flex items-center gap-2 text-primary hover:underline">
                          <span>Blog</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Perguntas Frequentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Como adicionar um novo cliente?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          Para adicionar um novo cliente, acesse a seção "Clientes" no menu lateral, 
                          clique em "Adicionar Cliente" e preencha os campos necessários com as informações do cliente.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Como criar um novo agendamento?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          Para criar um agendamento, acesse a seção "Agendamentos" no menu lateral, 
                          clique em "Novo Agendamento", selecione o cliente, o serviço, a data e o horário desejado.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>Como atualizar meu plano?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          Para atualizar seu plano, acesse a seção "Planos" no menu lateral, 
                          selecione o plano desejado e clique em "Assinar". Siga as instruções para 
                          concluir o pagamento e ativar seu novo plano.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>Como usar o sistema de fidelidade?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          O sistema de fidelidade está disponível no plano Premium. 
                          Acesse a seção "Fidelidade" no menu lateral para criar programas de pontos,
                          recompensas e benefícios para fidelizar seus clientes.
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5">
                        <AccordionTrigger>Como gerenciar meu estoque?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          No módulo "Estoque", você pode adicionar produtos, controlar quantidades,
                          definir preços e receber alertas quando os produtos estiverem acabando.
                          Ideal para manter seu salão sempre abastecido.
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Help;
