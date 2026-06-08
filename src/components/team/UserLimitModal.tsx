import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTeamLimits } from '@/hooks/useTeamLimits';

interface UserLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void;
}

export const UserLimitModal = ({ open, onOpenChange, onCancel }: UserLimitModalProps) => {
  const navigate = useNavigate();
  const { getUpgradeInfo, getUserLimitInfo } = useTeamLimits();
  
  const upgradeInfo = getUpgradeInfo();
  const limitInfo = getUserLimitInfo();

  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/planos');
  };

  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <DialogTitle className="text-base sm:text-lg">Limite de usuários atingido</DialogTitle>
          </div>
          <DialogDescription className="text-left text-xs sm:text-sm">
            Seu plano {upgradeInfo.currentPlan} permite até{' '}
            <span className="font-semibold">{limitInfo.limit} usuário{limitInfo.limit !== 1 ? 's' : ''}</span>.
            Para adicionar mais profissionais à equipe, migre para o plano{' '}
            {upgradeInfo.suggestedPlan}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-muted/50 rounded-lg border">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-sm">Usuários ativos</p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {limitInfo.current} / {limitInfo.limit} permitidos pelo seu plano
              </p>
            </div>
          </div>

          {upgradeInfo.suggestedPlan && (
            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <p className="font-medium text-sm text-primary">Plano {upgradeInfo.suggestedPlan}</p>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {upgradeInfo.suggestedLimit} • Gestão de equipe avançada
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          {upgradeInfo.suggestedPlan && (
            <Button 
              onClick={handleUpgrade}
              className="w-full sm:w-auto"
            >
              <Crown className="w-4 h-4 mr-2" />
              Migrar para {upgradeInfo.suggestedPlan}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};