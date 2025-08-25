import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { WhatsAppSession } from '@/hooks/useWhatsAppIntegration';

interface WhatsAppStatusBadgeProps {
  session: WhatsAppSession;
  className?: string;
}

export const WhatsAppStatusBadge = ({ session, className }: WhatsAppStatusBadgeProps) => {
  const getStatusIcon = () => {
    switch (session.status) {
      case 'conectado':
        return <Wifi className="w-3 h-3" />;
      case 'pareando':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      default:
        return <WifiOff className="w-3 h-3" />;
    }
  };

  const getStatusText = () => {
    switch (session.status) {
      case 'conectado':
        return 'WhatsApp Conectado';
      case 'pareando':
        return 'WhatsApp Pareando';
      default:
        return 'WhatsApp Desconectado';
    }
  };

  const getStatusVariant = () => {
    switch (session.status) {
      case 'conectado':
        return 'default';
      case 'pareando':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Badge 
      variant={getStatusVariant()} 
      className={`flex items-center gap-1 ${className}`}
    >
      {getStatusIcon()}
      <span className="hidden sm:inline">{getStatusText()}</span>
    </Badge>
  );
};