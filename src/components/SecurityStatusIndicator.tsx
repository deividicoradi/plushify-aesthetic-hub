import React from 'react';
import { Shield, ShieldCheck, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SecurityStatusProps {
  className?: string;
}

export const SecurityStatusIndicator: React.FC<SecurityStatusProps> = ({ className }) => {
  // Simular status de segurança (em produção isso viria de um hook real)
  const securityStatus = {
    overall: 'high' as 'low' | 'medium' | 'high',
    csp: true,
    https: true,
    rateLimit: true,
    audit: true,
    sessionTimeout: true,
    lastSecurityEvent: null as Date | null
  };

  const getOverallIcon = () => {
    switch (securityStatus.overall) {
      case 'high':
        return <ShieldCheck className="h-5 w-5 text-green-500" />;
      case 'medium':
        return <Shield className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
    }
  };

  const getOverallColor = () => {
    switch (securityStatus.overall) {
      case 'high':
        return 'bg-green-50 border-green-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-red-50 border-red-200';
    }
  };

  const getStatusText = () => {
    switch (securityStatus.overall) {
      case 'high':
        return 'Segurança Otimizada';
      case 'medium':
        return 'Segurança Parcial';
      case 'low':
        return 'Vulnerabilidades Detectadas';
    }
  };

  return (
    <Card className={`${className} ${getOverallColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getOverallIcon()}
          Status de Segurança
        </CardTitle>
        <CardDescription className="text-xs">
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              HTTPS
            </span>
            <Badge variant={securityStatus.https ? "secondary" : "destructive"} className="h-4 text-xs">
              {securityStatus.https ? "✓" : "✗"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              CSP
            </span>
            <Badge variant={securityStatus.csp ? "secondary" : "destructive"} className="h-4 text-xs">
              {securityStatus.csp ? "✓" : "✗"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Rate Limit
            </span>
            <Badge variant={securityStatus.rateLimit ? "secondary" : "destructive"} className="h-4 text-xs">
              {securityStatus.rateLimit ? "✓" : "✗"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Auditoria
            </span>
            <Badge variant={securityStatus.audit ? "secondary" : "destructive"} className="h-4 text-xs">
              {securityStatus.audit ? "✓" : "✗"}
            </Badge>
          </div>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-200">
            <p className="text-xs text-blue-700 font-medium">
              🔧 Modo Desenvolvimento
            </p>
            <p className="text-xs text-blue-600">
              Algumas funcionalidades de segurança estão reduzidas para facilitar o desenvolvimento.
            </p>
          </div>
        )}

        {process.env.NODE_ENV === 'production' && (
          <div className="mt-3 p-2 bg-green-50 rounded-md border border-green-200">
            <p className="text-xs text-green-700 font-medium">
              🚀 Modo Produção
            </p>
            <p className="text-xs text-green-600">
              Todas as medidas de segurança estão ativas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};