
import React from 'react';
import { HelpCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <HelpCircle className="w-6 h-6 text-plush-600" />
        <h1 className="text-2xl font-bold">Ajuda</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-br from-plush-50 to-purple-50">
          <CardHeader>
            <CardTitle className="text-plush-700">Suporte ao Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Precisa de ajuda? Entre em contato com nosso suporte:</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Email:</span>
                  <a href="mailto:suporte@plushify.com" className="text-plush-600 hover:underline">
                    suporte@plushify.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">WhatsApp:</span>
                  <span>(00) 0000-0000</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Horário:</span>
                  <span>Seg - Sex, 9h às 18h</span>
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
              <a href="#" className="flex items-center gap-2 text-plush-600 hover:underline">
                <span>Guia de Introdução</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <a href="#" className="flex items-center gap-2 text-plush-600 hover:underline">
                <span>Tutoriais em Vídeo</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <a href="#" className="flex items-center gap-2 text-plush-600 hover:underline">
                <span>FAQs</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <a href="#" className="flex items-center gap-2 text-plush-600 hover:underline">
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
              <AccordionContent>
                Para adicionar um novo cliente, acesse a seção "Clientes" no menu lateral, 
                clique em "Adicionar Cliente" e preencha os campos necessários com as informações do cliente.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Como criar um novo agendamento?</AccordionTrigger>
              <AccordionContent>
                Para criar um agendamento, acesse a seção "Agendamentos" no menu lateral, 
                clique em "Novo Agendamento", selecione o cliente, o serviço, a data e o horário desejado.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Como atualizar meu plano?</AccordionTrigger>
              <AccordionContent>
                Para atualizar seu plano, acesse a seção "Planos" no menu lateral, 
                selecione o plano desejado e clique em "Assinar". Siga as instruções para 
                concluir o pagamento e ativar seu novo plano.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Como usar o módulo de comunicação?</AccordionTrigger>
              <AccordionContent>
                O módulo de comunicação está disponível no plano Starter ou superior. 
                Acesse a seção "Comunicação" no menu lateral para enviar mensagens para seus clientes,
                criar campanhas de marketing e gerenciar suas comunicações.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Como funciona o sistema de fidelidade?</AccordionTrigger>
              <AccordionContent>
                O sistema de fidelidade está disponível no plano Premium. 
                Acesse a seção "Fidelidade" no menu lateral para criar programas de pontos,
                recompensas e benefícios para fidelizar seus clientes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help;
