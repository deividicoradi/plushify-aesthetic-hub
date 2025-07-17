
import React, { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FeatureGuardProps {
  feature?: string;
  planFeature?: string;
  requiredPlan?: 'professional' | 'premium';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

// E-mail do usuário de teste com acesso completo
const TEST_USER_EMAIL = 'deividi@teste.com';

export const FeatureGuard = ({ 
  feature, 
  planFeature,
  requiredPlan,
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGuardProps) => {
  const { hasFeatureAccess, currentPlan, loading } = useSubscription();
  const { hasFeature } = usePlanLimits();
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  // Verificar se é o usuário de teste
  const isTestUser = user?.email === TEST_USER_EMAIL;

  useEffect(() => {
    const checkAccess = async () => {
      setChecking(true);
      
      // Se for usuário de teste, sempre tem acesso
      if (isTestUser) {
        setHasAccess(true);
        setChecking(false);
        return;
      }
      
      let access = false;
      
      // Check by required plan
      if (requiredPlan) {
        if (requiredPlan === 'professional') {
          access = currentPlan === 'professional' || currentPlan === 'premium';
        } else if (requiredPlan === 'premium') {
          access = currentPlan === 'premium';
        }
      }
      // Check by plan feature
      else if (planFeature) {
        access = Boolean(hasFeature(planFeature as any));
      }
      // Check by Supabase feature
      else if (feature) {
        access = await hasFeatureAccess(feature);
      }
      
      setHasAccess(access);
      setChecking(false);
    };

    if (!loading) {
      checkAccess();
    }
  }, [feature, planFeature, requiredPlan, hasFeatureAccess, hasFeature, currentPlan, loading, isTestUser]);

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
    const planName = currentPlan === 'trial' ? 'Trial' : 
                    currentPlan === 'professional' ? 'Professional' : 'Enterprise';
    
    const requiredPlanName = requiredPlan === 'professional' ? 'Professional' : 'Enterprise';

    return (
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
        <Lock className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="text-orange-800 dark:text-orange-200 font-medium">
              Funcionalidade não disponível no plano {planName}
            </p>
            <p className="text-orange-700 dark:text-orange-300 text-sm mt-1">
              {requiredPlan ? 
                `Faça upgrade para o plano ${requiredPlanName} ou superior para acessar esta funcionalidade.` :
                'Faça upgrade para acessar esta funcionalidade.'
              }
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
