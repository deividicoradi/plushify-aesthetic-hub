import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Send, Clock, CheckCircle2, User } from 'lucide-react';
import { useWhatsApp, WhatsAppContact, WhatsAppMessage } from '@/hooks/useWhatsApp';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from '@/components/ui/separator';

export function WhatsAppChat() {
  const { contacts, messages, loading, sendMessage, loadMessages, session } = useWhatsApp();
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [showNewContact, setShowNewContact] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact, loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      if (selectedContact) {
        await sendMessage(selectedContact.telefone, newMessage);
      } else if (newPhone.trim()) {
        await sendMessage(newPhone, newMessage);
        setNewPhone('');
        setNewContactName('');
        setShowNewContact(false);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const getContactInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredMessages = messages.filter(msg => 
    selectedContact ? msg.contact_phone === selectedContact.telefone : false
  );

  if (session.status !== 'conectado') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <MessageCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">WhatsApp não conectado</h3>
          <p className="text-muted-foreground text-center">
            Você precisa conectar sua conta do WhatsApp para usar o chat.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-[600px] w-full max-w-6xl mx-auto border rounded-lg overflow-hidden">
      {/* Lista de Contatos */}
      <div className="w-1/3 border-r bg-muted/30">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Conversas</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewContact(true)}
            >
              Nova Conversa
            </Button>
          </div>
          
          {showNewContact && (
            <Card className="mb-4">
              <CardContent className="p-3 space-y-2">
                <Input
                  placeholder="Número (com DDD)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
                <Input
                  placeholder="Nome do contato (opcional)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowNewContact(false)} variant="outline">
                    Cancelar
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => selectedContact ? null : setSelectedContact(null)}
                    disabled={!newPhone.trim()}
                  >
                    Iniciar Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id
                    ? 'bg-primary/10 border border-primary/20'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarFallback className="bg-primary/10">
                    {getContactInitials(contact.nome)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{contact.nome}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>{formatPhoneNumber(contact.telefone)}</span>
                  </div>
                  {contact.ultima_interacao && (
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(contact.ultima_interacao), 'dd/MM/yyyy HH:mm', {
                        locale: ptBR
                      })}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {contacts.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma conversa ainda</p>
                <p className="text-sm">Inicie uma nova conversa</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 flex flex-col">
        {selectedContact || showNewContact ? (
          <>
            {/* Cabeçalho do Chat */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center">
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarFallback>
                    {selectedContact 
                      ? getContactInitials(selectedContact.nome)
                      : newContactName ? getContactInitials(newContactName) : <User className="w-4 h-4" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedContact?.nome || newContactName || 'Novo Contato'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    <span>
                      {formatPhoneNumber(selectedContact?.telefone || newPhone)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {selectedContact && filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.direction === 'sent' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.direction === 'sent'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-1 mt-1 opacity-70">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">
                          {format(new Date(message.timestamp), 'HH:mm', {
                            locale: ptBR
                          })}
                        </span>
                        {message.direction === 'sent' && (
                          <CheckCircle2 className="w-3 h-3 ml-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {selectedContact && filteredMessages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma mensagem ainda</p>
                    <p className="text-sm">Inicie a conversa enviando uma mensagem</p>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Campo de Envio */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading}
                  size="lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Selecione uma conversa</h3>
              <p>Escolha um contato para começar a conversar ou inicie uma nova conversa.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}