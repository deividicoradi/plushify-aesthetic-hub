import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WhatsAppFeatureGuardProps {
  children: React.ReactNode;
}

export const WhatsAppFeatureGuard = ({ children }: WhatsAppFeatureGuardProps) => {
  const { currentPlan, loading } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Apenas plano premium tem acesso ao WhatsApp
  if (currentPlan !== 'premium') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
          <Lock className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="ml-2">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  WhatsApp Business é um recurso Premium
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Para acessar a integração completa com WhatsApp Business, incluindo:
                </p>
                <ul className="text-sm space-y-1 ml-4 mb-4">
                  <li>✅ Conversas ilimitadas com clientes</li>
                  <li>✅ Histórico completo de mensagens</li>
                  <li>✅ Envio e recebimento de mensagens</li>
                  <li>✅ Integração com cadastro de clientes</li>
                  <li>✅ Estatísticas e análises de conversas</li>
                </ul>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça upgrade para o <strong>Plano Premium</strong> e tenha acesso a este e outros recursos exclusivos.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/planos')}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Ver Planos e Fazer Upgrade
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
