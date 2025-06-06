
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, CheckCircle, AlertCircle, Settings, QrCode } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

const WhatsAppIntegration = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const navigate = useNavigate();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-session', {
        body: { action: 'status' }
      });

      if (data?.status === 'open') {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleDisconnect = async () => {
    try {
      await supabase.functions.invoke('whatsapp-session', {
        body: { action: 'logout' }
      });

      setConnectionStatus('disconnected');
      toast.success('WhatsApp desconectado');
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      toast.error('Erro ao desconectar');
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-3 h-3 mr-1" />
            Desconectado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Verificando...
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-green-600" />
          Integração WhatsApp
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {connectionStatus === 'connected' ? (
            <div className="space-y-3">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-800 dark:text-green-400">
                    WhatsApp Conectado!
                  </h3>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Seu WhatsApp está conectado e pronto para enviar mensagens automáticas.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/whatsapp-connection')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar Conexão
                </Button>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleDisconnect}
                >
                  Desconectar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <h3 className="font-medium text-blue-800 dark:text-blue-400 mb-2">
                  Conecte seu WhatsApp
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Escaneie um QR Code para conectar seu WhatsApp e começar a enviar mensagens automáticas.
                </p>
                
                <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
                  <p>✅ Sem custos por mensagem</p>
                  <p>✅ Usa seu próprio WhatsApp</p>
                  <p>✅ Controle total sobre as mensagens</p>
                  <p>✅ Integração simples e segura</p>
                </div>
              </div>
              
              <Button 
                className="w-full"
                onClick={() => navigate('/whatsapp-connection')}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Conectar WhatsApp
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppIntegration;
