import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, Shield } from 'lucide-react';

interface SessionWarningDialogProps {
  open: boolean;
  onExtend: () => void;
  onLogout: () => void;
  timeRemaining: string;
}

export const SessionWarningDialog: React.FC<SessionWarningDialogProps> = ({
  open,
  onExtend,
  onLogout,
  timeRemaining
}) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-warning/10 rounded-full">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <AlertDialogTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Sessão Expirando
              </AlertDialogTitle>
            </div>
          </div>
          <AlertDialogDescription className="text-left">
            Sua sessão expirará em <strong>{timeRemaining}</strong> por motivos de segurança.
            <br />
            <br />
            Deseja continuar navegando ou fazer logout agora?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onLogout} className="w-full sm:w-auto">
            Fazer Logout
          </AlertDialogCancel>
          <AlertDialogAction onClick={onExtend} className="w-full sm:w-auto">
            Continuar Navegando
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};