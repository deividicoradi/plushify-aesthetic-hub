import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DeletionStatus {
  can_delete: boolean;
  blocking_reason: string | null;
}

export const DeleteAccountSection: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [emailConfirm, setEmailConfirm] = useState('');
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: status, isLoading } = useQuery({
    queryKey: ['account-deletion-status'],
    queryFn: async (): Promise<DeletionStatus> => {
      const { data, error } = await supabase.rpc('get_account_deletion_status');
      if (error) throw error;
      return data as unknown as DeletionStatus;
    },
  });

  const canSubmit = emailConfirm.trim().toLowerCase() === (user?.email ?? '').toLowerCase()
    && password.length > 0
    && !isDeleting;

  const handleDelete = async () => {
    if (!user?.email) return;
    setIsDeleting(true);
    try {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });
      if (reauthError) {
        toast({ title: 'Senha incorreta', description: 'Verifique sua senha e tente novamente.', variant: 'destructive' });
        return;
      }

      const { data, error } = await supabase.functions.invoke('delete-account', { body: {} });
      if (error) throw new Error(error.message ?? 'Erro ao excluir conta');
      if (data?.error) throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));

      toast({ title: 'Conta excluída', description: 'Sentiremos sua falta. Você foi desconectado.' });
      await supabase.auth.signOut();
      navigate('/');
    } catch (err) {
      toast({ title: 'Erro ao excluir conta', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-destructive/50 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg text-destructive">Zona de risco</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Exclusão da conta, conforme a LGPD</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Ao excluir sua conta, seus dados pessoais (nome, telefone) são apagados e o acesso é desativado
          imediatamente. Registros financeiros e de assinatura são mantidos por obrigação legal, sem
          identificar você. Essa ação não pode ser desfeita por você mesmo depois.
        </p>

        {isLoading ? (
          <p className="text-xs text-muted-foreground">Verificando...</p>
        ) : status && !status.can_delete ? (
          <p className="text-sm text-amber-600 bg-amber-500/10 rounded-md p-3">{status.blocking_reason}</p>
        ) : (
          <Button variant="destructive" size="sm" className="gap-2" onClick={() => setOpen(true)}>
            <Trash2 className="w-4 h-4" />
            Excluir minha conta
          </Button>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEmailConfirm(''); setPassword(''); } }}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirmar exclusão da conta
            </DialogTitle>
            <DialogDescription>
              Isso é irreversível. Digite seu e-mail e sua senha para confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-email-confirm">Digite seu e-mail ({user?.email}) para confirmar</Label>
              <Input
                id="delete-email-confirm"
                value={emailConfirm}
                onChange={(e) => setEmailConfirm(e.target.value)}
                placeholder={user?.email ?? ''}
                disabled={isDeleting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-password">Sua senha</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDeleting}
              />
            </div>
            <Button
              variant="destructive"
              className="w-full gap-2"
              disabled={!canSubmit}
              onClick={handleDelete}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Excluir minha conta definitivamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
