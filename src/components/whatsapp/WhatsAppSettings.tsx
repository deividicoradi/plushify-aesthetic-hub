import React, { useState } from 'react';
import { MessageCircle, Settings, AlertCircle, Server, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { WhatsAppMonitoring } from './WhatsAppMonitoring';
import { WhatsAppChat } from './WhatsAppChat';

export const WhatsAppSettings: React.FC = () => {
  const { session, contacts, messages } = useWhatsApp();
  
  const isConnected = session.status === 'conectado';
  const isPairing = session.status === 'pareando';
  const isConnecting = session.status === 'conectando';

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-500';
    if (isPairing || isConnecting) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    if (isConnected) return 'Conectado';
    if (isPairing) return 'Pareando';
    if (isConnecting) return 'Conectando';
    return 'Desconectado';
  };

  const totalMessages = messages.length;
  const sentMessages = messages.filter(m => m.direction === 'sent').length;
  const receivedMessages = messages.filter(m => m.direction === 'received').length;

  return (
    <Tabs defaultValue="chat" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="chat" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Chat
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurações
        </TabsTrigger>
        <TabsTrigger value="monitoring" className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Monitoramento
        </TabsTrigger>
      </TabsList>

      <TabsContent value="chat" className="mt-6">
        <WhatsAppChat />
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Status do WPPConnect
              </CardTitle>
              <CardDescription>
                Informações da conexão com WhatsApp via WPPConnect
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status da conexão */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
                  <div>
                    <h4 className="font-medium">Status da Conexão</h4>
                    <p className="text-sm text-muted-foreground">
                      {isConnected 
                        ? 'WhatsApp conectado via WPPConnect'
                        : isPairing
                        ? 'Escaneie o QR Code para conectar'
                        : isConnecting
                        ? 'Iniciando conexão com servidor'
                        : 'Clique em "Conectar WhatsApp" na aba Conexão'
                      }
                    </p>
                    {session.last_activity && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Última atividade: {new Date(session.last_activity).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary">
                  {getStatusText()}
                </Badge>
              </div>

              <Separator />

              {/* Informações do WPPConnect */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  Como Funciona
                </h4>
                
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    <strong>WPPConnect:</strong> Integração com servidor WPPConnect hospedado externamente.
                    A conexão é feita via QR Code, similar ao WhatsApp Web.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <div>
                      <strong>Servidor WPPConnect:</strong> Hospedado externamente, mantém a sessão do WhatsApp
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <div>
                      <strong>Edge Functions:</strong> Supabase Edge Functions fazem a comunicação segura com o servidor
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <div>
                      <strong>Webhooks:</strong> QR Code e eventos são recebidos automaticamente via webhook
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <div>
                      <strong>Banco de Dados:</strong> Mensagens e contatos armazenados no Supabase
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Estatísticas */}
              <div>
                <h4 className="font-medium mb-4">Estatísticas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{contacts.length}</div>
                    <div className="text-sm text-muted-foreground">Contatos</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{sentMessages}</div>
                    <div className="text-sm text-muted-foreground">Enviadas</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{receivedMessages}</div>
                    <div className="text-sm text-muted-foreground">Recebidas</div>
                  </div>
                </div>
              </div>

              {/* Informações importantes */}
              <div className="space-y-3">
                <h4 className="font-medium">Informações Importantes</h4>
                
                <Alert>
                  <Server className="h-4 w-4" />
                  <AlertDescription>
                    <strong>WPPConnect:</strong> A integração usa um servidor WPPConnect externo para 
                    manter a sessão do WhatsApp ativa e funcionando.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Recursos do WPPConnect */}
          <Card>
            <CardHeader>
              <CardTitle>Integração WPPConnect</CardTitle>
              <CardDescription>
                Recursos e funcionalidades disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-green-800 dark:text-green-200">
                  ✅ Recursos Implementados
                </h4>
                <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                  <li>• Conexão via QR Code com WPPConnect</li>
                  <li>• Envio e recebimento de mensagens de texto</li>
                  <li>• Interface de chat integrada</li>
                  <li>• Gerenciamento de contatos</li>
                  <li>• Histórico completo de conversas</li>
                  <li>• Webhooks para QR code e eventos</li>
                  <li>• Sessão mantida no servidor WPPConnect</li>
                  <li>• Estatísticas em tempo real</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">
                  🔒 Segurança
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Token seguro para comunicação com servidor</li>
                  <li>• Webhook verificado com token</li>
                  <li>• Row Level Security (RLS) ativo</li>
                  <li>• Dados isolados por usuário</li>
                  <li>• Comunicação via Edge Functions seguras</li>
                </ul>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-yellow-800 dark:text-yellow-200">
                  ⚙️ Arquitetura
                </h4>
                <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li>• Servidor WPPConnect externo mantém a sessão</li>
                  <li>• Edge Functions: sessao-de-whatsapp, enviar-mensagem-whatsapp</li>
                  <li>• Webhook: whatsapp-qr-webhook (recebe QR e eventos)</li>
                  <li>• Tabela whatsapp_sessions armazena estado da conexão</li>
                  <li>• Realtime via Supabase para atualização do QR</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>WPPConnect:</strong> Solução baseada em Puppeteer que automatiza o WhatsApp Web,
                  mantendo compatibilidade com as funcionalidades do WhatsApp oficial.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="monitoring" className="mt-6">
        <WhatsAppMonitoring />
      </TabsContent>
    </Tabs>
  );
};