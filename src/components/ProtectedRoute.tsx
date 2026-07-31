
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { MfaGate } from '@/components/MfaGate';

// Rotas acessíveis mesmo com o trial vencido — precisa conseguir assinar um
// plano, pedir ajuda, ver/editar a conta e sair, mesmo sem acesso ao app.
const PLAN_EXPIRED_ALLOWED_ROUTES = ['/app/planos', '/app/help', '/settings', '/profile'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentPlan, subscription, loading: subLoading } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [securityCheck, setSecurityCheck] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !subLoading) {
      console.log(`[GUARD] verificação auth → rota ${location.pathname} → resultado: ${user ? 'AUTORIZADO' : 'NEGADO'} (sem loop)`);
      
      setSecurityCheck(true);
      setIsLoading(false);
    }
  }, [authLoading, subLoading, user?.id, currentPlan, location.pathname]); // FIX: user?.id ao invés de user

  if (isLoading || authLoading || subLoading) {
    console.log(`[SUSPENSE] fallback ativo para ${location.pathname} - aguardando auth:${authLoading} sub:${subLoading}`);
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // SEGURANÇA: Redirecionar usuários autenticados tentando acessar páginas de auth
  if (user && (location.pathname === '/auth' || location.pathname === '/signup')) {
    console.log('SECURITY: Authenticated user redirected from auth pages');
    return <Navigate to="/dashboard" replace />;
  }

  // SEGURANÇA: Verificar autenticação
  if (!user) {
    console.log('SECURITY: Unauthenticated user redirected to auth');
    const searchParams = new URLSearchParams(location.search);
    const redirect = searchParams.get('redirect');
    
    return <Navigate 
      to={`/auth${redirect ? `?redirect=${redirect}` : ''}`} 
      replace 
      state={{ from: location }} 
    />;
  }

  // SEGURANÇA: trial ou plano pago vencido — bloqueia o app inteiro e
  // redireciona pra assinatura, mantendo os dados já cadastrados (não apaga
  // nada, só corta o acesso). Usa subscription.plan_type (o valor cru salvo
  // no banco) em vez de currentPlan porque currentPlan já vem rebaixado pra
  // 'trial' pelo useSubscription quando a data vence — precisamos saber que
  // o plano ERA pago pra mostrar a mensagem certa ("assinatura venceu" em
  // vez de "teste acabou").
  const isTrialExpired =
    subscription?.plan_type === 'trial' &&
    !!subscription?.trial_ends_at &&
    new Date(subscription.trial_ends_at) < new Date();

  const isPaidPlanExpired =
    !!subscription &&
    subscription.plan_type !== 'trial' &&
    !!subscription.expires_at &&
    new Date(subscription.expires_at) < new Date();

  if ((isTrialExpired || isPaidPlanExpired) && !PLAN_EXPIRED_ALLOWED_ROUTES.some(route => location.pathname.startsWith(route))) {
    console.log('SECURITY: Plan expired, redirecting to plans', { isTrialExpired, isPaidPlanExpired });
    const message = isPaidPlanExpired
      ? 'Sua assinatura venceu. Renove seu plano para continuar usando o Plushify — seus dados continuam salvos.'
      : 'Seu período de teste de 7 dias terminou. Escolha um plano para continuar usando o Plushify — seus dados continuam salvos.';
    return <Navigate to="/app/planos" replace state={{ message, from: location }} />;
  }

  // SEGURANÇA: Verificar acesso a funcionalidades premium para usuários trial
  // Estoque saiu daqui de propósito: o Trial inclui estoque básico (até 10
  // produtos, já limitado em useProductsData/LimitAlert) — bloquear a rota
  // inteira contradizia a própria promessa do plano. Quem precisa de aviso
  // de upgrade agora usa o mesmo padrão inline (FeatureGuard) de qualquer
  // outra tela, em vez de um redirect forçado pra /app/planos.
  const financialAdvancedFeatures = ['/financial/installments', '/financial/reports'];

  if (currentPlan === 'trial') {
    if (financialAdvancedFeatures.some(route => location.pathname === route)) {
      console.log('SECURITY: Trial user blocked from advanced financial features');
      return <Navigate to="/financial" replace state={{ 
        message: 'Funcionalidade avançada requer upgrade de plano.',
        from: location 
      }} />;
    }
  }

  // SEGURANÇA: Verificar se é uma rota que requer assinatura paga
  const paidRoutes = ['/dashboard', '/clients', '/appointments', '/financial', '/inventory'];
  const requiresPaidPlan = paidRoutes.some(route => location.pathname.startsWith(route));
  
  if (requiresPaidPlan && currentPlan === 'trial') {
    // Para trial, permitir acesso mas com limitações (já implementado nos componentes)
    console.log('SECURITY: Trial user accessing paid features with limitations');
  }

  return <MfaGate>{children}</MfaGate>;
}
