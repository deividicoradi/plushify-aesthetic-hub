import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useStaffPin } from '@/hooks/team/useStaffPin';
import { useStaffMode, type StaffPermissionKey } from '@/contexts/StaffModeContext';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StaffModeDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { teamMembers } = useTeamMembers();
  const { verifyPin } = useStaffPin();
  const { enterStaffMode } = useStaffMode();
  const [memberId, setMemberId] = useState('');
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);

  const activeMembers = teamMembers.filter((m) => m.status === 'active');

  const handleClose = (o: boolean) => {
    if (!o) {
      setMemberId('');
      setPin('');
    }
    onOpenChange(o);
  };

  const handleSubmit = async () => {
    if (!memberId || !pin) return;
    setVerifying(true);
    try {
      const ok = await verifyPin(memberId, pin);
      if (!ok) {
        toast({ title: 'PIN incorreto', description: 'Verifique o PIN ou se ele foi configurado para este membro.', variant: 'destructive' });
        return;
      }
      const member = teamMembers.find((m) => m.id === memberId)!;
      enterStaffMode({
        id: member.id,
        name: member.name,
        role: member.role,
        permissions: (member.permissions as Record<StaffPermissionKey, boolean>) ?? {},
      });
      toast({ title: 'Modo funcionário ativado', description: `Interface restrita conforme o cargo de ${member.name}.` });
      handleClose(false);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Entrar em Modo Funcionário</DialogTitle>
          <DialogDescription>
            A interface fica restrita conforme as permissões do cargo. A sessão continua sendo a sua — use "Sair do modo funcionário" pra voltar ao acesso completo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Funcionário</Label>
            <Select value={memberId} onValueChange={setMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o funcionário" />
              </SelectTrigger>
              <SelectContent>
                {activeMembers.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name} — {m.role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff-mode-pin">PIN</Label>
            <Input
              id="staff-mode-pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!memberId || !pin || verifying}>
            {verifying ? 'Verificando...' : 'Entrar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
