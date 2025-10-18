import React, { useState } from 'react';
import { MessageCircle, Smartphone, Settings, AlertCircle, Key, Phone, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { WhatsAppMonitoring } from './WhatsAppMonitoring';
import { WhatsAppChat } from './WhatsAppChat';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const WhatsAppSettings: React.FC = () => {
  const { session, contacts, messages, loading } = useWhatsApp();
  const { toast } = useToast();
  
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getStatusColor = () => {
    switch (session.status) {
      case 'conectado':
        return 'bg-green-500';
      case 'conectando':
      case 'pareando':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'conectado':
        return 'Conectado';
      case 'conectando':
        return 'Conectando';
      case 'pareando':
        return 'Configurando';
      default:
        return 'Desconectado';
    }
  };

  const handleSaveCredentials = async () => {
    if (!phoneNumberId || !wabaId || !accessToken) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase.from('wa_accounts').upsert({
        tenant_id: user.id,
        phone_number_id: phoneNumberId,
        waba_id: wabaId,
        token_encrypted: accessToken,
        status: 'active',
        updated_at: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Credenciais salvas",
        description: "Configuração do WhatsApp Cloud API atualizada com sucesso"
      });

      // Limpar campos sensíveis
      setAccessToken('');
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
                Status do WhatsApp Cloud API
              </CardTitle>
              <CardDescription>
                Configurações e informações da conexão com WhatsApp Business
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
                      {session.status === 'conectado' 
                        ? 'WhatsApp Cloud API conectado e funcionando'
                        : 'Configure suas credenciais para conectar'
                      }
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {getStatusText()}
                </Badge>
              </div>

              <Separator />

              {/* Configuração da Cloud API */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Credenciais WhatsApp Cloud API
                </h4>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Obtenha suas credenciais:</strong> Acesse o{' '}
                    <a 
                      href="https://developers.facebook.com/apps" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline text-primary"
                    >
                      Meta for Developers
                    </a>
                    {' '}e crie um app WhatsApp Business.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="wabaId" className="flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      WhatsApp Business Account ID (WABA ID)
                    </Label>
                    <Input
                      id="wabaId"
                      value={wabaId}
                      onChange={(e) => setWabaId(e.target.value)}
                      placeholder="123456789012345"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumberId" className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      Phone Number ID
                    </Label>
                    <Input
                      id="phoneNumberId"
                      value={phoneNumberId}
                      onChange={(e) => setPhoneNumberId(e.target.value)}
                      placeholder="987654321098765"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="accessToken" className="flex items-center gap-2">
                      <Key className="h-3 w-3" />
                      Access Token (Permanente)
                    </Label>
                    <Input
                      id="accessToken"
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="EAAG..."
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Use um token de sistema (permanente) para produção
                    </p>
                  </div>

                  <Button 
                    onClick={handleSaveCredentials} 
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? 'Salvando...' : 'Salvar Configuração'}
                  </Button>
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

              <Separator />

              {/* Informações importantes */}
              <div className="space-y-3">
                <h4 className="font-medium">Informações Importantes</h4>
                
                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    <strong>API Oficial:</strong> Usa a WhatsApp Business Cloud API oficial do Meta.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Webhooks:</strong> Configure webhooks para receber mensagens em tempo real.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Segurança:</strong> Tokens são armazenados de forma segura no Vault do Supabase.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Recursos da API WhatsApp Cloud */}
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Business Cloud API</CardTitle>
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
                  <li>• Envio e recebimento de mensagens em tempo real</li>
                  <li>• Interface de chat integrada na aplicação</li>
                  <li>• Gerenciamento automático de contatos</li>
                  <li>• Histórico completo de conversas</li>
                  <li>• Limitação de taxa (60 req/min)</li>
                  <li>• Auditoria completa de operações</li>
                  <li>• Verificação de assinatura de webhooks</li>
                  <li>• Alertas de segurança automáticos</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-blue-800 dark:text-blue-200">
                  🔒 Segurança
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Tokens armazenados no Vault do Supabase</li>
                  <li>• Verificação HMAC-SHA256 em webhooks</li>
                  <li>• Rate limiting por tenant</li>
                  <li>• Logs de auditoria detalhados</li>
                  <li>• Rotação automática de tokens</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>API Oficial:</strong> Sistema integrado diretamente com a API oficial do WhatsApp Business Cloud, 
                  garantindo estabilidade, segurança e conformidade com as políticas do WhatsApp.
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