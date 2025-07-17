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
      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">
              Usuários ativos: {limitInfo.current} / {limitInfo.limit === 'Ilimitado' ? '∞' : limitInfo.limit}
            </p>
            <p className="text-xs text-muted-foreground">
              Permitidos pelo seu plano {upgradeInfo.currentPlan}
            </p>
          </div>
        </div>
        
        {(isAtLimit || isNearLimit) && (
          <div className="flex items-center gap-2">
            {isAtLimit && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Limite atingido
              </Badge>
            )}
            {isNearLimit && !isAtLimit && (
              <Badge variant="outline" className="text-xs border-orange-200 text-orange-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Próximo ao limite
              </Badge>
            )}
            {showUpgradeButton && upgradeInfo.suggestedPlan && (
              <Button
                size="sm"
                onClick={() => navigate('/planos')}
                className="h-8 px-3"
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
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Uso de usuários</h3>
              <p className="text-sm text-muted-foreground">
                {limitInfo.current} / {limitInfo.limit === 'Ilimitado' ? '∞' : limitInfo.limit} usuários ativos
              </p>
              {limitInfo.limit !== 'Ilimitado' && (
                <div className="mt-2 w-48">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isAtLimit ? 'bg-destructive' : 
                        isNearLimit ? 'bg-orange-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(limitInfo.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {limitInfo.percentage}% utilizado
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-right">
            {isAtLimit && (
              <Badge variant="destructive" className="mb-2">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Limite atingido
              </Badge>
            )}
            
            {showUpgradeButton && upgradeInfo.suggestedPlan && isAtLimit && (
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">
                  Seu plano permite até {limitInfo.limit} usuários
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/planos')}
                  className="w-full"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Migrar para {upgradeInfo.suggestedPlan}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
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