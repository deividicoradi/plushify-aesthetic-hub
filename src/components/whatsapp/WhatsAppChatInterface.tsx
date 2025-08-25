import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, User, Settings, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useWhatsApp, WhatsAppContact, WhatsAppMessage } from '@/hooks/useWhatsApp';

export const WhatsAppChatInterface: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<WhatsAppContact | null>(null);
  const [messageText, setMessageText] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [showNewContact, setShowNewContact] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, contacts, sendMessage, loadMessages, disconnectWhatsApp } = useWhatsApp();

  // Filtrar contatos baseado na pesquisa
  const filteredContacts = contacts.filter(contact => 
    contact.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.telefone.includes(searchQuery)
  );

  // Filtrar mensagens do contato selecionado
  const contactMessages = selectedContact 
    ? messages.filter(msg => msg.contato_id === selectedContact.id)
    : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [contactMessages]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages(selectedContact.id);
    }
  }, [selectedContact, loadMessages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      if (selectedContact) {
        await sendMessage(selectedContact.telefone, messageText);
        setMessageText('');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleNewContact = async () => {
    if (!newContactPhone.trim() || !messageText.trim()) return;

    try {
      await sendMessage(newContactPhone, messageText);
      setMessageText('');
      setNewContactPhone('');
      setNewContactName('');
      setShowNewContact(false);
    } catch (error) {
      console.error('Erro ao enviar mensagem para novo contato:', error);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm', { locale: ptBR });
  };

  return (
    <div className="flex-1 flex">
      {/* Sidebar de contatos */}
      <div className="w-80 border-r flex flex-col">
        {/* Header da sidebar */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Conversas</h3>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowNewContact(!showNewContact)}
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={disconnectWhatsApp}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Barra de pesquisa */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar contatos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Novo contato */}
        {showNewContact && (
          <div className="p-4 bg-muted/50 border-b space-y-2">
            <Input
              placeholder="Número do telefone"
              value={newContactPhone}
              onChange={(e) => setNewContactPhone(e.target.value)}
            />
            <Input
              placeholder="Nome (opcional)"
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
            />
          </div>
        )}

        {/* Lista de contatos */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-muted' : ''
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-green-100 text-green-700">
                    {contact.nome.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{contact.nome}</p>
                    {contact.ultima_interacao && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(contact.ultima_interacao), 'dd/MM', { locale: ptBR })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{contact.telefone}</p>
                </div>
              </div>
            ))}
            
            {filteredContacts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum contato encontrado</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col">
        {selectedContact || showNewContact ? (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-green-100 text-green-700">
                  {showNewContact 
                    ? (newContactName || newContactPhone || 'N').charAt(0).toUpperCase()
                    : selectedContact!.nome.charAt(0).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h4 className="font-medium">
                  {showNewContact 
                    ? (newContactName || newContactPhone || 'Novo contato')
                    : selectedContact!.nome
                  }
                </h4>
                <p className="text-sm text-muted-foreground">
                  {showNewContact ? newContactPhone : selectedContact!.telefone}
                </p>
              </div>
              
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Phone className="h-4 w-4" />
              </Button>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {contactMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direcao === 'enviada' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.direcao === 'enviada'
                          ? 'bg-green-500 text-white'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.conteudo}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className={`text-xs ${
                          message.direcao === 'enviada' ? 'text-green-100' : 'text-muted-foreground'
                        }`}>
                          {formatMessageTime(message.horario)}
                        </span>
                        {message.direcao === 'enviada' && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-1 py-0 h-4 bg-green-600 text-green-100"
                          >
                            {message.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input de mensagem */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      showNewContact ? handleNewContact() : handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={showNewContact ? handleNewContact : handleSendMessage}
                  disabled={!messageText.trim() || (showNewContact && !newContactPhone.trim())}
                  size="icon"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Estado vazio */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha um contato para começar a conversar
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};