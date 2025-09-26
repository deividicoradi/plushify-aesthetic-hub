import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSecurity } from '@/components/SecurityProvider';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const SecureLoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [error, setError] = useState('');

  const { sanitizeInput, detectXSS, detectCodeInjection, detectBruteForce, loginRateLimit } = useSecurity();

  const handleInputChange = (value: string, setter: (value: string) => void) => {
    // Sanitizar e validar entrada
    const sanitized = sanitizeInput(value);
    
    // Detectar tentativas de XSS/injeção
    if (detectXSS(sanitized) || detectCodeInjection(sanitized)) {
      setError('Entrada inválida detectada. Tentativa bloqueada por segurança.');
      return;
    }

    setter(sanitized);
    setError(''); // Limpar erro se entrada for válida
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar rate limiting
    if (!loginRateLimit.attempt(false)) {
      setError(`Limite de tentativas excedido. Aguarde ${loginRateLimit.remainingTime} segundos.`);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: sanitizeInput(email),
        password: password // Senha não deve ser sanitizada para manter caracteres especiais
      });

      if (authError) {
        const newFailedAttempts = failedAttempts + 1;
        setFailedAttempts(newFailedAttempts);
        
        // Detectar tentativas de brute force
        detectBruteForce(newFailedAttempts);
        
        // Marcar tentativa como falhada para rate limiting
        loginRateLimit.attempt(false);
        
        setError('Email ou senha incorretos.');
      } else {
        // Login bem-sucedido - resetar contadores
        setFailedAttempts(0);
        loginRateLimit.reset();
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl">Login Seguro</CardTitle>
        </div>
        <CardDescription>
          Entre com suas credenciais de forma segura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Indicador de Rate Limiting */}
        {loginRateLimit.blocked && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Conta temporariamente bloqueada. Restam {loginRateLimit.remainingTime} segundos.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => handleInputChange(e.target.value, setEmail)}
              disabled={isLoading || loginRateLimit.blocked}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || loginRateLimit.blocked}
                required
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || loginRateLimit.blocked || !email || !password}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Informações de Segurança */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-between">
            <span>Tentativas restantes:</span>
            <span className={loginRateLimit.remainingRequests <= 2 ? 'text-destructive font-medium' : ''}>
              {loginRateLimit.remainingRequests}/{loginRateLimit.maxRequests}
            </span>
          </div>
          {failedAttempts > 0 && (
            <div className="flex items-center justify-between">
              <span>Tentativas falhadas:</span>
              <span className="text-destructive font-medium">{failedAttempts}</span>
            </div>
          )}
        </div>

        {import.meta.env.MODE === 'development' && (
          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border">
            <strong>Dev Mode:</strong> Sistema de segurança ativo com monitoramento de XSS, rate limiting e auditoria.
          </div>
        )}
      </CardContent>
    </Card>
  );
};