import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Wifi, Shield, Clock } from 'lucide-react';
import { useSecureWhatsAppAuth } from '@/hooks/useSecureWhatsAppAuth';
import { useAuth } from '@/contexts/AuthContext';

export const SecureWhatsAppConnection = () => {
  const { user } = useAuth();
  const { 
    whatsappSession, 
    loading, 
    loginWithCredentials, 
    isTokenValid 
  } = useSecureWhatsAppAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const success = await loginWithCredentials(email, password);
    if (success) {
      setShowLogin(false);
      setEmail('');
      setPassword('');
    }
  };

  const getStatusColor = () => {
    if (!whatsappSession) return 'text-muted-foreground';
    
    switch (whatsappSession.status) {
      case 'conectado':
        return 'text-green-600';
      case 'pareando':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  const getStatusIcon = () => {
    if (!whatsappSession) return <Shield className="w-4 h-4" />;
    
    switch (whatsappSession.status) {
      case 'conectado':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'pareando':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Shield className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Conexão Segura WhatsApp
        </CardTitle>
        <CardDescription>
          Autenticação isolada por usuário com tokens seguros
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Sessão */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium">Status:</span>
            <span className={`capitalize ${getStatusColor()}`}>
              {whatsappSession?.status || 'Não conectado'}
            </span>
          </div>
          {whatsappSession && isTokenValid() && (
            <div className="text-sm text-muted-foreground">
              Token válido
            </div>
          )}
        </div>

        {/* Informações da Sessão */}
        {whatsappSession && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sessão ID:</span>
              <span className="font-mono text-xs">
                {whatsappSession.session_id.slice(0, 20)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última atividade:</span>
              <span>
                {new Date(whatsappSession.last_activity).toLocaleString()}
              </span>
            </div>
            {whatsappSession.server_url && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Servidor:</span>
                <span className="font-mono text-xs">
                  {whatsappSession.server_url}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Alerta de Segurança */}
        <Alert>
          <Shield className="w-4 h-4" />
          <AlertDescription>
            Sua sessão WhatsApp é isolada e protegida. Apenas você pode acessar 
            suas conversas e configurações. Rate limiting ativo para prevenir abuso.
          </AlertDescription>
        </Alert>

        {/* Login Form */}
        {!whatsappSession && (
          <div className="space-y-4">
            {!showLogin ? (
              <Button 
                onClick={() => setShowLogin(true)} 
                className="w-full"
                disabled={loading}
              >
                <Lock className="w-4 h-4 mr-2" />
                Autenticar para WhatsApp
              </Button>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={loading || !email || !password}
                    className="flex-1"
                  >
                    {loading ? 'Autenticando...' : 'Conectar'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowLogin(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Funcionalidades Ativas */}
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium mb-2">Recursos de Segurança Ativos:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>✓ Isolamento de sessões por usuário</li>
            <li>✓ Tokens JWT com renovação automática</li>
            <li>✓ Rate limiting (30 req/min por usuário)</li>
            <li>✓ Validação de tokens em tempo real</li>
            <li>✓ Cleanup automático na desconexão</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};