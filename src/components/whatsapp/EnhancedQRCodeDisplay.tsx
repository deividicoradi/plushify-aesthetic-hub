import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  QrCode, 
  RefreshCw, 
  Smartphone, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

interface QRCodeDisplayProps {
  qrCode?: string;
  status: 'conectado' | 'desconectado' | 'pareando' | 'conectando' | 'expirado';
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function EnhancedQRCodeDisplay({ 
  qrCode, 
  status, 
  onRefresh, 
  isLoading = false 
}: QRCodeDisplayProps) {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos
  const [isExpired, setIsExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Reset timer quando novo QR é gerado
  useEffect(() => {
    if (qrCode && status === 'pareando') {
      setTimeLeft(120);
      setIsExpired(false);
    }
  }, [qrCode, status]);

  // Countdown timer
  useEffect(() => {
    if (status === 'pareando' && timeLeft > 0 && !isExpired) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsExpired(true);
            toast({
              title: "QR Code Expirado",
              description: "Gerando novo QR Code automaticamente...",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, timeLeft, isExpired, toast]);

  // Auto refresh quando expira
  useEffect(() => {
    if (isExpired && status === 'pareando') {
      const autoRefresh = setTimeout(() => {
        handleRefresh();
      }, 2000);

      return () => clearTimeout(autoRefresh);
    }
  }, [isExpired, status]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      setTimeLeft(120);
      setIsExpired(false);
      toast({
        title: "QR Code Atualizado",
        description: "Novo QR Code gerado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Atualizar",
        description: "Falha ao gerar novo QR Code.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'conectado':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          badge: <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Conectado</Badge>,
          title: "WhatsApp Conectado",
          description: "Sua sessão está ativa e funcionando.",
          showQR: false
        };
      case 'pareando':
        return {
          icon: <QrCode className="w-5 h-5 text-blue-500" />,
          badge: <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Aguardando</Badge>,
          title: "Escaneie o QR Code",
          description: "Use seu WhatsApp para escanear o código abaixo.",
          showQR: true
        };
      case 'conectando':
        return {
          icon: <Wifi className="w-5 h-5 text-yellow-500 animate-pulse" />,
          badge: <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">Conectando</Badge>,
          title: "Estabelecendo Conexão",
          description: "Conectando com os servidores do WhatsApp...",
          showQR: false
        };
      case 'expirado':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          badge: <Badge variant="destructive">Expirado</Badge>,
          title: "Sessão Expirada",
          description: "Sua sessão expirou. Conecte novamente.",
          showQR: false
        };
      default:
        return {
          icon: <WifiOff className="w-5 h-5 text-gray-500" />,
          badge: <Badge variant="secondary">Desconectado</Badge>,
          title: "WhatsApp Desconectado",
          description: "Clique em conectar para iniciar uma nova sessão.",
          showQR: false
        };
    }
  };

  const statusConfig = getStatusConfig();
  const progressValue = (timeLeft / 120) * 100;
  const isQRValid = qrCode && status === 'pareando' && !isExpired;

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          {statusConfig.icon}
          <CardTitle className="text-lg">{statusConfig.title}</CardTitle>
        </div>
        <div className="flex justify-center">
          {statusConfig.badge}
        </div>
        <CardDescription>{statusConfig.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {statusConfig.showQR && (
          <>
            {/* QR Code Container */}
            <div className="relative">
              <div className={`
                flex items-center justify-center p-6 border-2 border-dashed rounded-lg
                transition-all duration-300
                ${isQRValid 
                  ? 'border-blue-300 bg-blue-50/50' 
                  : 'border-red-300 bg-red-50/50'
                }
              `}>
                {isLoading || isRefreshing ? (
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {isRefreshing ? 'Gerando novo QR...' : 'Carregando...'}
                    </span>
                  </div>
                ) : isQRValid ? (
                  <div className="flex flex-col items-center gap-3">
                    <img 
                      src={qrCode} 
                      alt="QR Code WhatsApp" 
                      className="w-48 h-48 rounded-lg shadow-sm animate-scale-in"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <div>
                      <p className="font-medium text-red-700">QR Code Expirado</p>
                      <p className="text-sm text-red-600">Gerando novo código...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay de expiração */}
              {isExpired && isQRValid && (
                <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center animate-fade-in">
                  <div className="bg-white/90 px-4 py-2 rounded-lg border border-red-200">
                    <span className="text-red-700 font-medium">Expirado</span>
                  </div>
                </div>
              )}
            </div>

            {/* Timer e Progresso */}
            {status === 'pareando' && !isExpired && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Tempo restante</span>
                  </div>
                  <span className={`font-mono font-medium ${
                    timeLeft < 30 ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <Progress 
                  value={progressValue} 
                  className={`h-2 transition-all duration-300 ${
                    timeLeft < 30 ? 'bg-red-100' : 'bg-blue-100'
                  }`}
                />
                
                {timeLeft < 30 && (
                  <div className="flex items-center gap-2 text-orange-600 text-sm animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    <span>QR Code expirando em breve</span>
                  </div>
                )}
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-blue-900">Como conectar:</p>
                  <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em "Dispositivos vinculados"</li>
                    <li>Toque em "Vincular um dispositivo"</li>
                    <li>Escaneie o QR Code acima</li>
                  </ol>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2">
          {(isExpired || status === 'expirado') && (
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="flex-1 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Gerando...' : 'Gerar Novo QR'}
            </Button>
          )}
          
          {status === 'pareando' && !isExpired && (
            <Button 
              variant="outline" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}