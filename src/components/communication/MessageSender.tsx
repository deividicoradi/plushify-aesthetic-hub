
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Users, MessageSquare, Phone, Mail } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface MessageTemplate {
  id: number;
  title: string;
  content?: string;
}

interface MessageSenderProps {
  templates: MessageTemplate[];
}

const MessageSender = ({ templates }: MessageSenderProps) => {
  const [selectedChannel, setSelectedChannel] = useState('whatsapp');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Digite uma mensagem antes de enviar.");
      return;
    }

    if (selectedChannel === 'whatsapp' && !phoneNumber) {
      toast.error("Digite o número do WhatsApp para envio individual.");
      return;
    }

    setIsSending(true);

    try {
      if (selectedChannel === 'whatsapp') {
        await sendWhatsAppMessage();
      } else {
        // Simular envio para outros canais
        await simulateChannelSend();
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsSending(false);
    }
  };

  const sendWhatsAppMessage = async () => {
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: { 
          action: 'send',
          number: formattedNumber,
          message: message
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Mensagem enviada via WhatsApp!`);
        setMessage('');
        setPhoneNumber('');
      } else {
        throw new Error(data?.error || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro WhatsApp:', error);
      throw error;
    }
  };

  const simulateChannelSend = async () => {
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success(`Mensagem enviada via ${getChannelLabel(selectedChannel)} para ${getAudienceLabel(selectedAudience)}!`);
    setMessage('');
  };

  const formatPhoneNumber = (number: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = number.replace(/\D/g, '');
    
    // Se não começar com 55 (Brasil), adiciona
    if (!cleaned.startsWith('55')) {
      return `55${cleaned}`;
    }
    
    return cleaned;
  };

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template && template.content) {
      setMessage(template.content);
      toast.success(`Template "${template.title}" aplicado!`);
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return 'WhatsApp';
      case 'sms': return 'SMS';
      case 'email': return 'Email';
      default: return 'Canal selecionado';
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'all': return 'todos os clientes';
      case 'active': return 'clientes ativos';
      case 'inactive': return 'clientes inativos';
      case 'vip': return 'clientes VIP';
      default: return 'público selecionado';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <Phone className="w-4 h-4 text-green-600" />;
      case 'sms': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'email': return <Mail className="w-4 h-4 text-purple-600" />;
      default: return <Send className="w-4 h-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Enviar Mensagens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configurações de Envio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Canal</label>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger>
                {getChannelIcon(selectedChannel)}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-600" />
                    WhatsApp
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    SMS
                  </div>
                </SelectItem>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    Email
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Público</label>
            <Select value={selectedAudience} onValueChange={setSelectedAudience}>
              <SelectTrigger>
                <Users className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                <SelectItem value="active">Clientes ativos</SelectItem>
                <SelectItem value="inactive">Clientes inativos</SelectItem>
                <SelectItem value="vip">Clientes VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Template</label>
            <Select onValueChange={handleUseTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Escolher template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Campo específico para WhatsApp */}
        {selectedChannel === 'whatsapp' && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Número do WhatsApp (opcional - deixe vazio para envio em massa)
            </label>
            <Input
              placeholder="Ex: 11999999999 ou +5511999999999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Para teste individual, digite um número. Para envio em massa, deixe vazio.
            </p>
          </div>
        )}

        {/* Preview do Envio */}
        <div className="flex items-center gap-2 p-3 bg-accent/50 rounded-lg">
          <Badge variant="outline" className="flex items-center gap-1">
            {getChannelIcon(selectedChannel)}
            {getChannelLabel(selectedChannel).toUpperCase()}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {selectedChannel === 'whatsapp' && phoneNumber
              ? `Enviando para: ${phoneNumber}`
              : `Enviando para: ${getAudienceLabel(selectedAudience)}`
            }
          </span>
        </div>

        {/* Campo de Mensagem */}
        <div>
          <label className="text-sm font-medium mb-2 block">Mensagem</label>
          <Textarea
            placeholder="Digite sua mensagem aqui..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {message.length}/1000 caracteres
            </span>
            {message.length > 1000 && (
              <span className="text-xs text-destructive">
                Limite excedido
              </span>
            )}
          </div>
        </div>

        {/* Botão de Envio */}
        <Button 
          onClick={handleSendMessage} 
          className="w-full"
          disabled={!message.trim() || message.length > 1000 || isSending}
          size="lg"
        >
          {isSending ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessageSender;
