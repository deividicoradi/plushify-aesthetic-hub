
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Settings, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from "sonner";

const WhatsAppIntegration = () => {
  const [whatsappConfig, setWhatsappConfig] = useState({
    phoneNumber: '',
    apiKey: '',
    isConnected: false
  });

  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleConnect = () => {
    if (!whatsappConfig.phoneNumber || !whatsappConfig.apiKey) {
      toast.error("Preencha todos os campos para conectar.");
      return;
    }

    // Simular conexão
    setWhatsappConfig({...whatsappConfig, isConnected: true});
    toast.success("WhatsApp conectado com sucesso!");
    setIsConfigOpen(false);
  };

  const handleDisconnect = () => {
    setWhatsappConfig({...whatsappConfig, isConnected: false});
    toast.success("WhatsApp desconectado.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          Integração WhatsApp
          {whatsappConfig.isConnected ? (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
              <CheckCircle className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {whatsappConfig.isConnected ? (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✅ WhatsApp conectado com sucesso!
                </p>
                <p className="text-xs text-green-600 dark:text-green-500">
                  Número: {whatsappConfig.phoneNumber}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Button variant="destructive" size="sm" onClick={handleDisconnect}>
                  Desconectar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Configure sua integração com WhatsApp para enviar mensagens automaticamente.
              </p>
              
              <Tabs defaultValue="whatsapp-business" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="whatsapp-business">WhatsApp Business</TabsTrigger>
                  <TabsTrigger value="api-external">API Externa</TabsTrigger>
                </TabsList>
                
                <TabsContent value="whatsapp-business" className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">WhatsApp Business API</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Integração oficial com WhatsApp Business para empresas.
                    </p>
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open('https://business.whatsapp.com/', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Configurar WhatsApp Business
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="api-external" className="space-y-3">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">APIs de Terceiros</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Integre com serviços como Evolution API, Baileys ou similares.
                    </p>
                    
                    <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="w-full">
                          <Settings className="w-4 h-4 mr-2" />
                          Configurar API
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        {/* Dialog de Configuração */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configurar WhatsApp</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Número do WhatsApp</label>
                <Input
                  placeholder="Ex: +5511999999999"
                  value={whatsappConfig.phoneNumber}
                  onChange={(e) => setWhatsappConfig({...whatsappConfig, phoneNumber: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Chave da API</label>
                <Input
                  type="password"
                  placeholder="Sua chave de API"
                  value={whatsappConfig.apiKey}
                  onChange={(e) => setWhatsappConfig({...whatsappConfig, apiKey: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Esta chave será usada para autenticar com o serviço de WhatsApp
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsConfigOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleConnect} className="flex-1">
                  Conectar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default WhatsAppIntegration;
