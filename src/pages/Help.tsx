
import React from 'react';
import { HelpCircle, ExternalLink, Mail, MessageCircle, Clock, BookOpen, Video, FileText, Rss } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

const Help = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
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
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                      </div>
                      <CardTitle className="text-blue-900 dark:text-blue-100">Suporte ao Cliente</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <p className="text-blue-700 dark:text-blue-300">Precisa de ajuda? Entre em contato com nosso suporte:</p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-blue-900 dark:text-blue-100">Email:</span>
                            <a href="mailto:suporte@plushify.com" className="ml-2 text-blue-600 dark:text-blue-400 hover:underline">
                              suporte@plushify.com
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                            <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-blue-900 dark:text-blue-100">WhatsApp:</span>
                            <span className="ml-2 text-blue-700 dark:text-blue-300">(00) 0000-0000</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="p-1 bg-orange-100 dark:bg-orange-900 rounded">
                            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <div>
                            <span className="font-semibold text-blue-900 dark:text-blue-100">Horário:</span>
                            <span className="ml-2 text-blue-700 dark:text-blue-300">Seg - Sex, 9h às 18h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                        <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                      </div>
                      <CardTitle className="text-purple-900 dark:text-purple-100">Base de Conhecimento</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <p className="text-purple-700 dark:text-purple-300 mb-4">Recursos para aprender e resolver dúvidas:</p>
                      <a href="#" className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-green-100 dark:bg-green-900 rounded">
                            <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-purple-900 dark:text-purple-100 font-medium">Guia de Introdução</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-red-100 dark:bg-red-900 rounded">
                            <Video className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-purple-900 dark:text-purple-100 font-medium">Tutoriais em Vídeo</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-purple-900 dark:text-purple-100 font-medium">FAQs</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a href="#" className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-orange-100 dark:bg-orange-900 rounded">
                            <Rss className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-purple-900 dark:text-purple-100 font-medium">Blog</span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* FAQ Section */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
                    </div>
                    <CardTitle className="text-green-900 dark:text-green-100">Perguntas Frequentes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-green-200 dark:border-green-800">
                      <AccordionTrigger className="text-green-900 dark:text-green-100 hover:text-green-700 dark:hover:text-green-300">
                        Como adicionar um novo cliente?
                      </AccordionTrigger>
                      <AccordionContent className="text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        Para adicionar um novo cliente, acesse a seção "Clientes" no menu lateral, 
                        clique em "Adicionar Cliente" e preencha os campos necessários com as informações do cliente.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border-green-200 dark:border-green-800">
                      <AccordionTrigger className="text-green-900 dark:text-green-100 hover:text-green-700 dark:hover:text-green-300">
                        Como criar um novo agendamento?
                      </AccordionTrigger>
                      <AccordionContent className="text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        Para criar um agendamento, acesse a seção "Agendamentos" no menu lateral, 
                        clique em "Novo Agendamento", selecione o cliente, o serviço, a data e o horário desejado.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border-green-200 dark:border-green-800">
                      <AccordionTrigger className="text-green-900 dark:text-green-100 hover:text-green-700 dark:hover:text-green-300">
                        Como atualizar meu plano?
                      </AccordionTrigger>
                      <AccordionContent className="text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        Para atualizar seu plano, acesse a seção "Planos" no menu lateral, 
                        selecione o plano desejado e clique em "Assinar". Siga as instruções para 
                        concluir o pagamento e ativar seu novo plano.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4" className="border-green-200 dark:border-green-800">
                      <AccordionTrigger className="text-green-900 dark:text-green-100 hover:text-green-700 dark:hover:text-green-300">
                        Como usar o sistema de fidelidade?
                      </AccordionTrigger>
                      <AccordionContent className="text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        O sistema de fidelidade está disponível no plano Premium. 
                        Acesse a seção "Fidelidade" no menu lateral para criar programas de pontos,
                        recompensas e benefícios para fidelizar seus clientes.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-5" className="border-green-200 dark:border-green-800">
                      <AccordionTrigger className="text-green-900 dark:text-green-100 hover:text-green-700 dark:hover:text-green-300">
                        Como gerenciar meu estoque?
                      </AccordionTrigger>
                      <AccordionContent className="text-green-700 dark:text-green-300 bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-800">
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Help;
