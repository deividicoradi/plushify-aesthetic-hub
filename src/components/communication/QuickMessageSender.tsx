
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Users, MessageSquare } from 'lucide-react';
import { toast } from "sonner";

interface MessageTemplate {
  id: number;
  title: string;
  content?: string;
}

interface QuickMessageSenderProps {
  templates: MessageTemplate[];
  onUseTemplate: (template: MessageTemplate) => void;
}

const QuickMessageSender = ({ templates, onUseTemplate }: QuickMessageSenderProps) => {
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedChannel, setSelectedChannel] = useState('whatsapp');
  const [message, setMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Digite uma mensagem antes de enviar.");
      return;
    }

    // Simular envio
    toast.success(`Mensagem enviada via ${selectedChannel} para ${getAudienceLabel(selectedAudience)}!`);
    setMessage('');
  };

  const handleUseTemplate = (templateId: string) => {
    const template = templates.find(t => t.id.toString() === templateId);
    if (template && template.content) {
      setMessage(template.content);
      onUseTemplate(template);
      toast.success(`Template "${template.title}" aplicado!`);
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
      case 'whatsapp': return '📱';
      case 'sms': return '💬';
      case 'email': return '📧';
      default: return '📤';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-primary" />
          Envio Rápido de Mensagens
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Configurações de Envio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              <label className="text-sm font-medium mb-2 block">Canal</label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <span className="flex items-center gap-2">
                      📱 WhatsApp
                    </span>
                  </SelectItem>
                  <SelectItem value="sms">
                    <span className="flex items-center gap-2">
                      💬 SMS
                    </span>
                  </SelectItem>
                  <SelectItem value="email">
                    <span className="flex items-center gap-2">
                      📧 Email
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Template</label>
              <Select value={selectedTemplate} onValueChange={handleUseTemplate}>
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

          {/* Preview do Público */}
          <div className="flex items-center gap-2 p-2 bg-accent/50 rounded-lg">
            <Badge variant="outline">
              {getChannelIcon(selectedChannel)} {selectedChannel.toUpperCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Enviando para: {getAudienceLabel(selectedAudience)}
            </span>
          </div>

          {/* Área de Mensagem */}
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
            disabled={!message.trim() || message.length > 1000}
          >
            <Send className="w-4 h-4 mr-2" />
            Enviar Mensagem
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickMessageSender;
