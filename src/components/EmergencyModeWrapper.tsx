import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface EmergencyModeWrapperProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const EmergencyModeWrapper: React.FC<EmergencyModeWrapperProps> = ({ 
  children, 
  enabled = false 
}) => {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="p-6 space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          A aplicação está em modo de emergência. Algumas funcionalidades foram temporariamente desabilitadas para melhorar a performance.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Sistema em Otimização</CardTitle>
          <CardDescription>
            Estamos trabalhando para corrigir os problemas de performance. Por favor, aguarde.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};