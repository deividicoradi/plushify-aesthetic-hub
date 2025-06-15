
import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGuardProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export const FeatureGuard = ({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGuardProps) => {
  const { hasFeatureAccess, currentPlan, loading } = useSubscription();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAccess = async () => {
      setChecking(true);
      const access = await hasFeatureAccess(feature);
      setHasAccess(access);
      setChecking(false);
    };

    if (!loading) {
      checkAccess();
    }
  }, [feature, hasFeatureAccess, loading]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <Lock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="text-orange-800 dark:text-orange-200 font-medium">
              Funcionalidade não disponível no plano {currentPlan}
            </p>
            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
              Faça upgrade para acessar esta funcionalidade.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/planos')}
            className="bg-orange-600 hover:bg-orange-700 text-white ml-4"
          >
            <Crown className="w-4 h-4 mr-2" />
            Fazer Upgrade
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
