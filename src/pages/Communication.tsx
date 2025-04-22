
import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Send,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from "sonner";

const Communication = () => {
  const [message, setMessage] = useState('');

  const channels = [
    {
      title: "Email Marketing",
      icon: Mail,
      description: "Alcance seus clientes com campanhas personalizadas",
      count: "2.4k enviados",
      color: "text-plush-600"
    },
    {
      title: "SMS/WhatsApp",
      icon: Phone,
      description: "Comunicação direta e instantânea",
      count: "1.8k enviados",
      color: "text-accent2-500"
    },
    {
      title: "Chat em Tempo Real",
      icon: MessageSquare,
      description: "Atendimento personalizado imediato",
      count: "890 conversas",
      color: "text-plush-500"
    },
    {
      title: "Notificações Push",
      icon: Send,
      description: "Mantenha seus clientes atualizados",
      count: "3.2k enviadas",
      color: "text-accent2-600"
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      toast.success("Mensagem enviada com sucesso!");
      setMessage('');
    } else {
      toast.error("Por favor, digite uma mensagem.");
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-8 h-8 text-plush-600" />
            <h1 className="text-3xl font-bold font-serif">Comunicação</h1>
          </div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Central de Ajuda
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Precisa de ajuda?</h4>
                <p className="text-sm">
                  Nossa equipe está disponível 24/7 para ajudar você com suas dúvidas sobre comunicação com clientes.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>

        {/* Canais de Comunicação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((channel) => (
            <Card key={channel.title} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <channel.icon className={`w-5 h-5 ${channel.color}`} />
                  {channel.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{channel.description}</p>
                <p className="text-sm font-medium mt-2">{channel.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem Rápida */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-xl">Mensagem Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSendMessage}>
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Drawer para Detalhes */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full">
              Ver Estatísticas Detalhadas
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Estatísticas de Comunicação</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-plush-600">98%</p>
                      <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-accent2-500">45%</p>
                      <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default Communication;

