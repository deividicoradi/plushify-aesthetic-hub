import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Loader2, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User
} from 'lucide-react';

interface MessageSenderProps {
  onSendMessage: (phone: string, message: string, contactName?: string) => Promise<boolean>;
  isConnected: boolean;
  isLoading?: boolean;
}

export default function EnhancedMessageSender({ 
  onSendMessage, 
  isConnected, 
  isLoading = false 
}: MessageSenderProps) {
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [contactName, setContactName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica formatação brasileira
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const validateForm = () => {
    const phoneNumbers = phone.replace(/\D/g, '');
    
    if (!phoneNumbers || phoneNumbers.length < 10) {
      toast({
        title: "Telefone Inválido",
        description: "Digite um número de telefone válido com DDD.",
        variant: "destructive",
      });
      return false;
    }

    if (!message.trim()) {
      toast({
        title: "Mensagem Vazia",
        description: "Digite uma mensagem para enviar.",
        variant: "destructive",
      });
      return false;
    }

    if (message.length > 1000) {
      toast({
        title: "Mensagem Muito Longa",
        description: "A mensagem deve ter no máximo 1000 caracteres.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm() || !isConnected) return;

    setIsSending(true);
    setSendStatus('sending');

    try {
      const phoneNumbers = phone.replace(/\D/g, '');
      const formattedPhone = phoneNumbers.startsWith('55') ? phoneNumbers : `55${phoneNumbers}`;
      
      const success = await onSendMessage(formattedPhone, message.trim(), contactName.trim() || undefined);
      
      if (success) {
        setSendStatus('success');
        setMessage('');
        setPhone('');
        setContactName('');
        
        toast({
          title: "Mensagem Enviada",
          description: `Mensagem enviada para ${phone} com sucesso!`,
        });
        
        // Reset status após 3 segundos
        setTimeout(() => setSendStatus('idle'), 3000);
      } else {
        setSendStatus('error');
        setTimeout(() => setSendStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Send message error:', error);
      setSendStatus('error');
      setTimeout(() => setSendStatus('idle'), 3000);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusConfig = () => {
    switch (sendStatus) {
      case 'sending':
        return {
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
          badge: <Badge className="bg-blue-100 text-blue-700">Enviando...</Badge>,
          color: 'blue'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          badge: <Badge className="bg-green-100 text-green-700">Enviada!</Badge>,
          color: 'green'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4 text-red-500" />,
          badge: <Badge variant="destructive">Erro no Envio</Badge>,
          color: 'red'
        };
      default:
        return {
          icon: <MessageSquare className="w-4 h-4" />,
          badge: null,
          color: 'gray'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const characterCount = message.length;
  const isFormValid = phone.replace(/\D/g, '').length >= 10 && message.trim().length > 0;

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {statusConfig.icon}
            <div>
              <CardTitle className="text-lg">Enviar Mensagem</CardTitle>
              <CardDescription>
                {isConnected 
                  ? "Digite o número e mensagem para enviar" 
                  : "Conecte o WhatsApp primeiro para enviar mensagens"
                }
              </CardDescription>
            </div>
          </div>
          {statusConfig.badge}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Campo Nome do Contato */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Nome do Contato (opcional)
          </label>
          <Input
            placeholder="Ex: João Silva"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            disabled={!isConnected || isSending}
            className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Campo Telefone */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Número do WhatsApp *
          </label>
          <Input
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={handlePhoneChange}
            disabled={!isConnected || isSending}
            className={`transition-all duration-200 focus:ring-2 ${
              phone && phone.replace(/\D/g, '').length >= 10 
                ? 'focus:ring-green-500 border-green-300' 
                : 'focus:ring-blue-500'
            }`}
          />
          <p className="text-xs text-muted-foreground">
            Digite com DDD (ex: 11999999999)
          </p>
        </div>

        {/* Campo Mensagem */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Mensagem *</label>
            <span className={`text-xs ${
              characterCount > 900 
                ? 'text-red-500' 
                : characterCount > 700 
                  ? 'text-orange-500' 
                  : 'text-muted-foreground'
            }`}>
              {characterCount}/1000
            </span>
          </div>
          <Textarea
            placeholder="Digite sua mensagem aqui..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!isConnected || isSending}
            rows={4}
            maxLength={1000}
            className={`transition-all duration-200 focus:ring-2 resize-none ${
              message.trim().length > 0 
                ? 'focus:ring-green-500 border-green-300' 
                : 'focus:ring-blue-500'
            }`}
          />
        </div>

        {/* Status de Conexão */}
        {!isConnected && (
          <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-700">
              WhatsApp não está conectado. Conecte primeiro para enviar mensagens.
            </span>
          </div>
        )}

        {/* Botão de Envio */}
        <Button
          onClick={handleSend}
          disabled={!isConnected || !isFormValid || isSending || isLoading}
          className={`w-full transition-all duration-200 ${
            sendStatus === 'success' 
              ? 'bg-green-600 hover:bg-green-700' 
              : sendStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700'
                : ''
          }`}
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : sendStatus === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mensagem Enviada!
            </>
          ) : sendStatus === 'error' ? (
            <>
              <AlertCircle className="w-4 h-4 mr-2" />
              Tentar Novamente
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </>
          )}
        </Button>

        {/* Dicas de Uso */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas:</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use números com DDD (ex: 11999999999)</li>
            <li>• Mensagens são adicionadas à fila de processamento</li>
            <li>• Você receberá notificações sobre o status do envio</li>
            <li>• Evite spam - respeite as políticas do WhatsApp</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}