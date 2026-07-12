import React from 'react';
import { useTeamLimits } from '@/hooks/useTeamLimits';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UserLimitDisplayProps {
  showUpgradeButton?: boolean;
  variant?: 'card' | 'inline' | 'minimal';
}

export const UserLimitDisplay = ({ 
  showUpgradeButton = true, 
  variant = 'card' 
}: UserLimitDisplayProps) => {
  const { getUserLimitInfo, getUpgradeInfo } = useTeamLimits();
  const navigate = useNavigate();
  
  const limitInfo = getUserLimitInfo();
  const upgradeInfo = getUpgradeInfo();
  
  const isAtLimit = limitInfo.current >= (limitInfo.limit as number);
  const isNearLimit = limitInfo.percentage >= 80;

  if (variant === 'minimal') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>
          {limitInfo.current} / {limitInfo.limit === 'Ilimitado' ? '∞' : limitInfo.limit} usuários
        </span>
        {isAtLimit && (
          <Badge variant="destructive" className="text-xs">
            Limite atingido
          </Badge>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg border gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-xs sm:text-sm">
              Usuários ativos: {limitInfo.current} / {limitInfo.limit === 'Ilimitado' ? '∞' : limitInfo.limit}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              Permitidos pelo seu plano {upgradeInfo.currentPlan}
            </p>
          </div>
        </div>
        
        {(isAtLimit || isNearLimit) && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isAtLimit && (
              <Badge variant="destructive" className="text-[10px] sm:text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Limite atingido
              </Badge>
            )}
            {isNearLimit && !isAtLimit && (
              <Badge variant="outline" className="text-[10px] sm:text-xs border-orange-200 text-orange-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Próximo ao limite
              </Badge>
            )}
            {showUpgradeButton && upgradeInfo.suggestedPlan && (
              <Button
                size="sm"
                onClick={() => navigate('/app/planos')}
                className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-lg bg-primary/10">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Uso de usuários</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {limitInfo.current} / {limitInfo.limit === 'Ilimitado' ? '∞' : limitInfo.limit} usuários ativos
              </p>
              {limitInfo.limit !== 'Ilimitado' && (
                <div className="mt-2 w-40 sm:w-48">
                  <div className="w-full bg-secondary rounded-full h-1.5 sm:h-2">
                    <div 
                      className={`h-1.5 sm:h-2 rounded-full transition-all ${
                        isAtLimit ? 'bg-destructive' : 
                        isNearLimit ? 'bg-orange-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(limitInfo.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                    {limitInfo.percentage}% utilizado
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right w-full sm:w-auto">
            {isAtLimit && (
              <Badge variant="destructive" className="mb-2 text-[10px] sm:text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Limite atingido
              </Badge>
            )}
            
            {showUpgradeButton && upgradeInfo.suggestedPlan && isAtLimit && (
              <div className="text-xs sm:text-sm">
                <p className="text-muted-foreground mb-2">
                  Seu plano permite até {limitInfo.limit} usuários
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/app/planos')}
                  className="w-full sm:w-auto"
                >
                  <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Migrar para {upgradeInfo.suggestedPlan}
                </Button>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">
                  {upgradeInfo.suggestedLimit}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};