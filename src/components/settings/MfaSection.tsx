import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Loader2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type EnrolledFactor = {
  id: string;
  status: 'verified' | 'unverified';
  friendly_name?: string | null;
};

// Fluxo de cadastro TOTP em duas etapas, como exigido pela API do Supabase:
// 1) enroll() cria o factor "unverified" e devolve QR code + secret.
// 2) challenge() + verify() com o código de 6 dígitos do app autenticador
//    confirma posse do segredo e promove o factor pra "verified".
// Só factors "verified" contam pra Supabase exigir aal2 no próximo login.
export function MfaSection() {
  const [factors, setFactors] = useState<EnrolledFactor[]>([]);
  const [loadingFactors, setLoadingFactors] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [factorToRemove, setFactorToRemove] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  const loadFactors = async () => {
    setLoadingFactors(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error('Erro ao listar fatores MFA:', error);
      setLoadingFactors(false);
      return;
    }
    setFactors((data?.totp ?? []) as EnrolledFactor[]);
    setLoadingFactors(false);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const verifiedFactor = factors.find((f) => f.status === 'verified');

  const handleStartEnroll = async () => {
    setEnrolling(true);
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `plushify-${Date.now()}`,
    });
    if (error) {
      toast({ title: 'Erro ao iniciar cadastro', description: error.message, variant: 'destructive' });
      setEnrolling(false);
      return;
    }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
  };

  const handleCancelEnroll = async () => {
    // Remove o factor "unverified" que ficou pra trás se o usuário desistir
    // no meio do cadastro — evita acumular lixo em auth.mfa_factors.
    if (factorId) {
      await supabase.auth.mfa.unenroll({ factorId });
    }
    setEnrolling(false);
    setQrCode(null);
    setSecret(null);
    setFactorId(null);
    setVerifyCode('');
  };

  const handleVerifyEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    setVerifying(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: verifyCode,
      });
      if (verifyError) throw verifyError;

      toast({ title: 'Autenticação em duas etapas ativada', description: 'A partir do próximo login, você vai precisar informar o código do app autenticador.' });
      setEnrolling(false);
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerifyCode('');
      await loadFactors();
    } catch (err: any) {
      toast({ title: 'Código inválido', description: err.message || 'Confira o código e tente novamente.', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const handleRemoveFactor = async () => {
    if (!factorToRemove) return;
    setRemoving(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: factorToRemove });
      if (error) throw error;
      toast({ title: 'Autenticação em duas etapas desativada' });
      await loadFactors();
    } catch (err: any) {
      toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' });
    } finally {
      setRemoving(false);
      setFactorToRemove(null);
    }
  };

  const handleCopySecret = async () => {
    if (!secret) return;
    await navigator.clipboard.writeText(secret);
    toast({ title: 'Chave copiada', description: 'Cole no seu app autenticador caso não consiga ler o QR code.' });
  };

  if (loadingFactors) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Carregando status de autenticação em duas etapas...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold">Autenticação em duas etapas (2FA)</h3>
        {verifiedFactor ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={() => setFactorToRemove(verifiedFactor.id)}
          >
            <ShieldOff className="w-4 h-4" />
            Desativar
          </Button>
        ) : !enrolling ? (
          <Button onClick={handleStartEnroll} size="sm" className="gap-2">
            <ShieldCheck className="w-4 h-4" />
            Ativar 2FA
          </Button>
        ) : null}
      </div>

      {verifiedFactor && (
        <p className="text-sm text-muted-foreground">
          Ativada. A cada login, além da senha, será solicitado o código do seu app autenticador (Google Authenticator, Authy, etc).
        </p>
      )}

      {!verifiedFactor && !enrolling && (
        <p className="text-sm text-muted-foreground">
          Adicione uma camada extra de proteção: além da senha, um código gerado por um app autenticador no seu celular.
        </p>
      )}

      {enrolling && qrCode && (
        <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
          <div className="space-y-2">
            <p className="text-sm font-medium">1. Escaneie o QR code com seu app autenticador</p>
            <div
              className="w-40 h-40 bg-white p-2 rounded"
              // qr_code vem como SVG confiável direto da API do Supabase (não é
              // entrada de usuário) — seguro renderizar via dangerouslySetInnerHTML.
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground break-all">Ou digite a chave manualmente: {secret}</p>
              <Button type="button" variant="ghost" size="sm" onClick={handleCopySecret} className="shrink-0 gap-1 h-auto py-1">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <form onSubmit={handleVerifyEnroll} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="mfa-verify-code">2. Digite o código de 6 dígitos gerado pelo app</Label>
              <Input
                id="mfa-verify-code"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                disabled={verifying}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancelEnroll} disabled={verifying}>
                Cancelar
              </Button>
              <Button type="submit" disabled={verifying || verifyCode.length !== 6}>
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar e ativar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <AlertDialog open={!!factorToRemove} onOpenChange={(open) => !open && setFactorToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar autenticação em duas etapas?</AlertDialogTitle>
            <AlertDialogDescription>
              Sua conta ficará protegida só pela senha. Recomendado apenas se você estiver trocando de app autenticador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFactor} disabled={removing} className="bg-destructive hover:bg-destructive/90">
              {removing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
