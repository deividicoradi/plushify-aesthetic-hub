import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Portão de segunda etapa (aal2). Colocado dentro das guardas de rota
// (ProtectedRoute/AdminRoute) em vez de só no formulário de login, porque a
// sessão aal1 já existe assim que a senha é aceita — inclusive em abas
// abertas antes do login ou depois de um refresh. Checar aqui, no ponto de
// entrada de QUALQUER rota protegida, cobre todos esses casos de uma vez.
export function MfaGate({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuth();
  const [checking, setChecking] = useState(true);
  const [needsChallenge, setNeedsChallenge] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAal = async () => {
    setChecking(true);
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) {
      console.error('Erro ao verificar nível de autenticação:', error);
      setChecking(false);
      return;
    }
    if (data.nextLevel === 'aal2' && data.currentLevel !== 'aal2') {
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verified = factorsData?.totp?.find((f) => f.status === 'verified');
      setFactorId(verified?.id ?? null);
      setNeedsChallenge(true);
    } else {
      setNeedsChallenge(false);
    }
    setChecking(false);
  };

  useEffect(() => {
    checkAal();
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setVerifying(true);
    setError(null);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;

      setNeedsChallenge(false);
    } catch (err: any) {
      setError(err.message || 'Código inválido. Tente novamente.');
      setCode('');
    } finally {
      setVerifying(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (needsChallenge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm shadow-md">
          <CardHeader>
            <CardTitle>Verificação em duas etapas</CardTitle>
            <CardDescription>Digite o código do seu app autenticador para continuar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfa-challenge-code">Código de 6 dígitos</Label>
                <Input
                  id="mfa-challenge-code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={verifying}
                  required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificar'}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => signOut()} disabled={verifying}>
                Cancelar e sair
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
