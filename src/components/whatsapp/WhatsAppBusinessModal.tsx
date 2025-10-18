import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Smartphone, 
  MessageSquare, 
  Archive,
  QrCode,
  Wifi,
  Crown,
  Lock
} from 'lucide-react';
import { useWhatsAppRESTAPI } from '@/hooks/useWhatsAppRESTAPI';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { WhatsAppConnectionCard } from './WhatsAppConnectionCard';
import { WhatsAppConversations } from './WhatsAppConversations';

interface WhatsAppBusinessModalProps {
  trigger?: React.ReactNode;
}

export const WhatsAppBusinessModal = ({ trigger }: WhatsAppBusinessModalProps) => {
  const { session, connectWhatsApp } = useWhatsAppRESTAPI();
  const { currentPlan, loading } = useSubscription();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const getStatusBadge = () => {
    switch (session.status) {
      case 'conectado':
        return <Badge variant="default" className="bg-green-500">Dispositivo conectado</Badge>;
      case 'pareando':
        return <Badge variant="secondary" className="bg-yellow-500">Pareando dispositivo</Badge>;
      default:
        return <Badge variant="outline">Dispositivo desconectado</Badge>;
    }
  };

  const DefaultTrigger = () => (
    <Button variant="outline" size="sm" className="flex items-center gap-2">
      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
        <MessageCircle className="w-4 h-4 text-white" />
      </div>
      WhatsApp
    </Button>
  );

  // Verificar se tem acesso ao WhatsApp
  const hasWhatsAppAccess = currentPlan === 'premium';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <DefaultTrigger />}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        {!hasWhatsAppAccess ? (
          /* Sem acesso - Mostrar upgrade */
          <div className="p-6">
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
                      Faça upgrade para o <strong>Plano Premium</strong> e tenha acesso completo ao WhatsApp Business integrado.
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      setOpen(false);
                      navigate('/planos');
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Ver Planos Premium
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          /* Com acesso - Mostrar WhatsApp normal */
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          {/* Header */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-medium">WhatsApp</span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {session.status === 'pareando' && (
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => {/* Show QR */}}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    Mostrar QR Code
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {session.status === 'conectado' ? (
              /* Connected State - Show Conversations */
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wifi className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">WhatsApp Conectado</h2>
                  <p className="text-slate-300">
                    Seu WhatsApp está conectado e pronto para conversas
                  </p>
                </div>
                <div className="bg-white rounded-lg p-1">
                  <WhatsAppConversations />
                </div>
              </div>
            ) : (
              /* Disconnected State - Show Business Features */
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">WhatsApp Business</h2>
                  <p className="text-slate-300 text-lg">
                    Conecte seu WhatsApp para começar a conversar com seus clientes
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Conecte seu celular</h3>
                      <p className="text-slate-400 text-sm">
                        Use o WhatsApp do seu celular para se conectar
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Converse com clientes</h3>
                      <p className="text-slate-400 text-sm">
                        Envie e receba mensagens diretamente do sistema
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Archive className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">Histórico integrado</h3>
                      <p className="text-slate-400 text-sm">
                        Todas as conversas ficam salvas no sistema
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {session.status === 'pareando' ? (
                  /* Pairing State - Show QR */
                  <div className="bg-white rounded-lg p-1">
                    <WhatsAppConnectionCard />
                  </div>
                ) : (
                  /* Connect Button */
                  <div className="text-center">
                    <Button 
                      onClick={connectWhatsApp}
                      size="lg"
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg"
                    >
                      <Smartphone className="w-5 h-5 mr-2" />
                      Conectar WhatsApp
                    </Button>
                    <p className="text-slate-400 text-sm mt-2">
                      Clique para gerar o QR Code e conectar seu dispositivo
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};