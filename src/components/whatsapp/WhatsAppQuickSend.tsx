import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Send, Plus, X, Phone } from 'lucide-react';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { useToast } from '@/hooks/use-toast';

export function WhatsAppQuickSend() {
  const { session, sendMessage, contacts } = useWhatsAppIntegration();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [bulkPhones, setBulkPhones] = useState<string[]>(['']);
  const [bulkMode, setBulkMode] = useState(false);

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
  };

  const handleSend = async () => {
    if (session.status !== 'conectado') {
      toast({
        title: "Erro",
        description: "WhatsApp não está conectado",
        variant: "destructive"
      });
      return;
    }

    if (!phone.trim() || !message.trim()) {
      toast({
        title: "Erro",
        description: "Telefone e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      await sendMessage(phone.replace(/\D/g, ''), message);
      setPhone('');
      setMessage('');
      toast({
        title: "Sucesso",
        description: "Mensagem enviada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao enviar:', error);
    } finally {
      setSending(false);
    }
  };

  const handleBulkSend = async () => {
    if (session.status !== 'conectado') {
      toast({
        title: "Erro",
        description: "WhatsApp não está conectado",
        variant: "destructive"
      });
      return;
    }

    const validPhones = bulkPhones.filter(p => p.trim());
    
    if (validPhones.length === 0 || !message.trim()) {
      toast({
        title: "Erro",
        description: "Pelo menos um telefone e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    let successCount = 0;
    let errorCount = 0;

    for (const phoneNumber of validPhones) {
      try {
        await sendMessage(phoneNumber.replace(/\D/g, ''), message);
        successCount++;
        // Delay entre mensagens para evitar spam
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        errorCount++;
        console.error('Erro ao enviar para:', phoneNumber, error);
      }
    }

    setSending(false);
    setMessage('');
    setBulkPhones(['']);

    toast({
      title: "Envio Concluído",
      description: `${successCount} mensagens enviadas, ${errorCount} falharam`,
      variant: successCount > 0 ? "default" : "destructive"
    });
  };

  const addBulkPhone = () => {
    setBulkPhones([...bulkPhones, '']);
  };

  const removeBulkPhone = (index: number) => {
    if (bulkPhones.length > 1) {
      setBulkPhones(bulkPhones.filter((_, i) => i !== index));
    }
  };

  const updateBulkPhone = (index: number, value: string) => {
    const formatted = formatPhone(value);
    const newPhones = [...bulkPhones];
    newPhones[index] = formatted;
    setBulkPhones(newPhones);
  };

  if (session.status !== 'conectado') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Envio Rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Conecte o WhatsApp primeiro para enviar mensagens.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Envio Rápido
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkMode(!bulkMode)}
          >
            {bulkMode ? 'Envio Único' : 'Envio em Massa'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!bulkMode ? (
          // Envio único
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={15}
                />
                {contacts.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      // TODO: Implementar seletor de contatos
                      toast({
                        title: "Em breve",
                        description: "Seletor de contatos será implementado"
                      });
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mensagem</Label>
              <Textarea
                id="message"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={sending || !phone.trim() || !message.trim()}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </>
              )}
            </Button>
          </>
        ) : (
          // Envio em massa
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Telefones</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addBulkPhone}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              {bulkPhones.map((phoneNumber, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="(11) 99999-9999"
                    value={phoneNumber}
                    onChange={(e) => updateBulkPhone(index, e.target.value)}
                    maxLength={15}
                  />
                  {bulkPhones.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeBulkPhone(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bulk-message">Mensagem</Label>
              <Textarea
                id="bulk-message"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <Alert>
              <AlertDescription>
                As mensagens serão enviadas com intervalo de 1 segundo entre cada uma para evitar bloqueios.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleBulkSend}
              disabled={sending || bulkPhones.filter(p => p.trim()).length === 0 || !message.trim()}
              className="w-full"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar para {bulkPhones.filter(p => p.trim()).length} contato(s)
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}