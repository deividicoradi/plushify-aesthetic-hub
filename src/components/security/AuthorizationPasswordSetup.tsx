import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthorizationPassword } from '@/hooks/useAuthorizationPassword';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface AuthorizationPasswordSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AuthorizationPasswordSetup: React.FC<AuthorizationPasswordSetupProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { setPassword: setAuthPassword, isVerifying } = useAuthorizationPassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate password
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Set password
    const success = await setAuthPassword(password);
    if (success) {
      setPassword('');
      setConfirmPassword('');
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Configurar Senha de Autorização
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Esta senha será necessária para autorizar operações sensíveis como editar ou excluir pagamentos.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha de Autorização</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a senha"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isVerifying}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isVerifying}>
                {isVerifying ? 'Configurando...' : 'Configurar Senha'}
              </Button>
            </div>
          </form>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>⚠️ Requisitos de segurança:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Mínimo de 6 caracteres</li>
              <li>Mantenha esta senha segura</li>
              <li>Será solicitada para ações sensíveis</li>
              <li>Diferente da sua senha de login</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};