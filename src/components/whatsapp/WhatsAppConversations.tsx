import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Send, 
  MessageCircle, 
  Phone, 
  User, 
  Clock,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useWhatsAppIntegration, WhatsAppContact, WhatsAppMessage } from '@/hooks/useWhatsAppIntegration';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const WhatsAppConversations = () => {
  const { 
    session, 
    messages, 
    contacts, 
    loading, 
    error,
    sendMessage, 
    loadMessages, 
    loadContacts 
  } = useWhatsAppIntegration();
  
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewContact, setShowNewContact] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact =>
    contact.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.telefone.includes(searchQuery)
  );

  // Get messages for selected contact
  const contactMessages = messages.filter(message => 
    selectedContact ? message.contato_id === selectedContact.id : false
  );

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages when contact is selected
  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact, loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [contactMessages]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!selectedContact && !newPhone.trim()) return;

    setSendingMessage(true);
    try {
      const phone = selectedContact ? selectedContact.telefone : newPhone;
      await sendMessage(phone, newMessage);
      setNewMessage('');
      if (!selectedContact) {
        setNewPhone('');
        setShowNewContact(false);
        // Reload contacts to show the new one
        await loadContacts();
      }
      messageInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle key press in message input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message time
  const formatMessageTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true, 
      locale: ptBR 
    });
  };

  // Format phone number for display
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  if (session.status !== 'conectado') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversas WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Conecte o WhatsApp primeiro para acessar as conversas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
      {/* Contacts List */}
      <div className="lg:col-span-4">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Contatos
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowNewContact(true)}
              >
                <User className="w-4 h-4 mr-1" />
                Novo
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar contatos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum contato encontrado</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredContacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        setShowNewContact(false);
                      }}
                      className={`w-full p-3 rounded-lg text-left transition-colors hover:bg-accent ${
                        selectedContact?.id === contact.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {contact.nome.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{contact.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatPhone(contact.telefone)}
                          </div>
                          {contact.ultima_interacao && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatMessageTime(contact.ultima_interacao)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-8">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            {selectedContact ? (
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {selectedContact.nome.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedContact.nome}</CardTitle>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="w-3 h-3" />
                    {formatPhone(selectedContact.telefone)}
                  </div>
                </div>
              </div>
            ) : showNewContact ? (
              <CardTitle>Nova Conversa</CardTitle>
            ) : (
              <CardTitle className="text-muted-foreground">
                Selecione um contato para iniciar a conversa
              </CardTitle>
            )}
          </CardHeader>

          {(selectedContact || showNewContact) && (
            <>
              <Separator />
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  {selectedContact && contactMessages.length > 0 ? (
                    <div className="space-y-4">
                      {contactMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.direcao === 'enviada' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 ${
                              message.direcao === 'enviada'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">
                              {message.conteudo}
                            </div>
                            <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
                              <span>{formatMessageTime(message.horario)}</span>
                              {message.direcao === 'enviada' && (
                                <Badge variant="secondary" className="text-xs">
                                  {message.status}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : selectedContact ? (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma mensagem ainda</p>
                        <p className="text-sm">Envie a primeira mensagem para iniciar a conversa</p>
                      </div>
                    </div>
                  ) : null}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t">
                  {showNewContact && !selectedContact && (
                    <div className="mb-3">
                      <Input
                        placeholder="Número do telefone (ex: 11999999999)"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                        maxLength={15}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Textarea
                      ref={messageInputRef}
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="resize-none"
                      rows={2}
                      maxLength={1000}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !newMessage.trim() || (!selectedContact && !newPhone.trim())}
                      size="lg"
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2">
                    {newMessage.length}/1000 caracteres • Enter para enviar, Shift+Enter para quebrar linha
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};