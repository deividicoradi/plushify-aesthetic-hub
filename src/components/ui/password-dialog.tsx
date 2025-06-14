
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from 'lucide-react';

interface PasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (password: string, reason?: string) => void;
  title: string;
  description: string;
  isLoading?: boolean;
  requireReason?: boolean;
}

const PasswordDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  isLoading = false,
  requireReason = true
}: PasswordDialogProps) => {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    if (requireReason && !reason.trim()) return;
    
    onConfirm(password, reason);
    setPassword('');
    setReason('');
  };

  const handleClose = () => {
    setPassword('');
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{description}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Senha de Autorização</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoFocus
              />
            </div>

            {requireReason && (
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo da Alteração</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Descreva o motivo desta operação"
                  required
                />
              </div>
            )}
          </form>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            disabled={!password.trim() || (requireReason && !reason.trim()) || isLoading}
          >
            {isLoading ? 'Verificando...' : 'Confirmar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;
