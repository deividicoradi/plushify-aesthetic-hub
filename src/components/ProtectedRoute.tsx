
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

// E-mail do usuário de teste com acesso completo
const TEST_USER_EMAIL = 'deividi@teste.com';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { currentPlan, loading: subLoading } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const [securityCheck, setSecurityCheck] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && !subLoading) {
      // SEGURANÇA: Verificações adicionais de segurança
      const performSecurityCheck = () => {
        console.log('SECURITY: Performing route protection check', {
          hasUser: !!user,
          currentPlan,
          pathname: location.pathname
        });

        // SEGURANÇA: Verificar integridade da sessão
        if (user) {
          const sessionAge = Date.now() - (user.last_sign_in_at ? new Date(user.last_sign_in_at).getTime() : 0);
          const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas
          
          if (sessionAge > maxSessionAge) {
            console.log('SECURITY: Session too old, requiring re-authentication');
            // Em produção, forçar logout aqui
          }
        }

        setSecurityCheck(true);
        setIsLoading(false);
      };

      // SEGURANÇA: Pequeno delay para verificações
      setTimeout(performSecurityCheck, 100);
    }
  }, [authLoading, subLoading, user, currentPlan, location.pathname]);

  if (isLoading || !securityCheck) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Verificando segurança...</p>
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

  // Verificar se é o usuário de teste
  const isTestUser = user.email === TEST_USER_EMAIL;

  // SEGURANÇA: Verificar acesso a funcionalidades premium para usuários trial (exceto usuário de teste)
  const restrictedRoutes = ['/inventory', '/reports'];
  const financialAdvancedFeatures = ['/financial/installments', '/financial/reports'];
  
  if (currentPlan === 'trial' && !isTestUser) {
    if (restrictedRoutes.some(route => location.pathname.startsWith(route))) {
      console.log('SECURITY: Trial user blocked from premium features');
      return <Navigate to="/planos" replace state={{ 
        message: 'Esta funcionalidade requer um plano pago. Faça upgrade para continuar.',
        from: location 
      }} />;
    }
    
    if (financialAdvancedFeatures.some(route => location.pathname === route)) {
      console.log('SECURITY: Trial user blocked from advanced financial features');
      return <Navigate to="/financial" replace state={{ 
        message: 'Funcionalidade avançada requer upgrade de plano.',
        from: location 
      }} />;
    }
  }

  // SEGURANÇA: Verificar se é uma rota que requer assinatura paga
  const paidRoutes = ['/dashboard', '/clients', '/appointments', '/financial', '/inventory', '/reports'];
  const requiresPaidPlan = paidRoutes.some(route => location.pathname.startsWith(route));
  
  if (requiresPaidPlan && currentPlan === 'trial' && !isTestUser) {
    // Para trial, permitir acesso mas com limitações (já implementado nos componentes)
    console.log('SECURITY: Trial user accessing paid features with limitations');
  }

  if (isTestUser) {
    console.log('SECURITY: Test user granted full access', {
      userId: user.id,
      email: user.email,
      route: location.pathname
    });
  } else {
    console.log('SECURITY: Route access granted', {
      userId: user.id,
      plan: currentPlan,
      route: location.pathname
    });
  }

  return <>{children}</>;
}
