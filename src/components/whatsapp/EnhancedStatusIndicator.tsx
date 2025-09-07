import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wifi, 
  WifiOff, 
  Smartphone, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Zap,
  XCircle,
  Radio
} from 'lucide-react';

interface EnhancedStatusIndicatorProps {
  status: 'conectado' | 'desconectado' | 'pareando' | 'conectando' | 'expirado';
  lastActivity?: string;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'unknown';
  messageCount?: number;
  isAnimated?: boolean;
  showDetails?: boolean;
}

export default function EnhancedStatusIndicator({ 
  status, 
  lastActivity, 
  connectionQuality = 'unknown',
  messageCount = 0,
  isAnimated = true,
  showDetails = false
}: EnhancedStatusIndicatorProps) {

  const getStatusConfig = () => {
    switch (status) {
      case 'conectado':
        return {
          icon: <CheckCircle className={`w-4 h-4 text-green-500 ${isAnimated ? 'animate-pulse' : ''}`} />,
          badge: (
            <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
              <Wifi className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          ),
          color: 'green',
          title: 'WhatsApp Conectado',
          description: 'Sessão ativa e funcionando normalmente',
          pulseColor: 'bg-green-500'
        };
      
      case 'pareando':
        return {
          icon: <Smartphone className={`w-4 h-4 text-blue-500 ${isAnimated ? 'animate-bounce' : ''}`} />,
          badge: (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
              <Clock className="w-3 h-3 mr-1" />
              Aguardando QR
            </Badge>
          ),
          color: 'blue',
          title: 'Aguardando Pareamento',
          description: 'Escaneie o QR Code para conectar',
          pulseColor: 'bg-blue-500'
        };
      
      case 'conectando':
        return {
          icon: <RefreshCw className={`w-4 h-4 text-yellow-500 ${isAnimated ? 'animate-spin' : ''}`} />,
          badge: (
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
              <Zap className="w-3 h-3 mr-1" />
              Conectando
            </Badge>
          ),
          color: 'yellow',
          title: 'Estabelecendo Conexão',
          description: 'Conectando com os servidores WhatsApp...',
          pulseColor: 'bg-yellow-500'
        };
      
      case 'expirado':
        return {
          icon: <AlertTriangle className={`w-4 h-4 text-orange-500 ${isAnimated ? 'animate-pulse' : ''}`} />,
          badge: (
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">
              <Clock className="w-3 h-3 mr-1" />
              Expirado
            </Badge>
          ),
          color: 'orange',
          title: 'Sessão Expirada',
          description: 'QR Code expirou, gere um novo para conectar',
          pulseColor: 'bg-orange-500'
        };
      
      default: // desconectado
        return {
          icon: <WifiOff className="w-4 h-4 text-gray-500" />,
          badge: (
            <Badge variant="secondary" className="border-gray-200">
              <XCircle className="w-3 h-3 mr-1" />
              Desconectado
            </Badge>
          ),
          color: 'gray',
          title: 'WhatsApp Desconectado',
          description: 'Clique em conectar para iniciar uma sessão',
          pulseColor: 'bg-gray-500'
        };
    }
  };

  const getConnectionQualityConfig = () => {
    switch (connectionQuality) {
      case 'excellent':
        return {
          icon: <Radio className="w-3 h-3 text-green-500" />,
          text: 'Excelente',
          color: 'text-green-600'
        };
      case 'good':
        return {
          icon: <Radio className="w-3 h-3 text-yellow-500" />,
          text: 'Boa',
          color: 'text-yellow-600'
        };
      case 'poor':
        return {
          icon: <Radio className="w-3 h-3 text-red-500" />,
          text: 'Ruim',
          color: 'text-red-600'
        };
      default:
        return null;
    }
  };

  const formatLastActivity = (timestamp?: string) => {
    if (!timestamp) return null;
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    
    return date.toLocaleDateString();
  };

  const statusConfig = getStatusConfig();
  const qualityConfig = getConnectionQualityConfig();

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2 animate-fade-in">
        {statusConfig.icon}
        {statusConfig.badge}
      </div>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {statusConfig.icon}
              {/* Pulse animation for active states */}
              {(status === 'conectado' || status === 'conectando') && isAnimated && (
                <div className={`absolute inset-0 rounded-full ${statusConfig.pulseColor} opacity-25 animate-ping`} />
              )}
            </div>
            <div>
              <CardTitle className="text-base">{statusConfig.title}</CardTitle>
              <CardDescription className="text-sm">
                {statusConfig.description}
              </CardDescription>
            </div>
          </div>
          {statusConfig.badge}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Qualidade da Conexão */}
          {qualityConfig && status === 'conectado' && (
            <div className="flex items-center gap-2">
              {qualityConfig.icon}
              <span className="text-muted-foreground">Sinal:</span>
              <span className={qualityConfig.color}>{qualityConfig.text}</span>
            </div>
          )}

          {/* Contador de Mensagens */}
          {status === 'conectado' && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Mensagens:</span>
              <Badge variant="outline" className="px-2 py-0.5 text-xs">
                {messageCount}
              </Badge>
            </div>
          )}

          {/* Última Atividade */}
          {lastActivity && (
            <div className="col-span-2 flex items-center gap-2 pt-2 border-t">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground text-xs">
                Última atividade: {formatLastActivity(lastActivity)}
              </span>
            </div>
          )}
        </div>

        {/* Barra de Status Visual */}
        <div className="mt-4">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-xs text-muted-foreground">Status da Conexão</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                status === 'conectado' ? 'bg-green-500 w-full' :
                status === 'conectando' ? 'bg-yellow-500 w-3/4 animate-pulse' :
                status === 'pareando' ? 'bg-blue-500 w-1/2' :
                status === 'expirado' ? 'bg-orange-500 w-1/4' :
                'bg-gray-400 w-0'
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}