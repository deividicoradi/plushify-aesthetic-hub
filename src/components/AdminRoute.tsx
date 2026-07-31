import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { MfaGate } from '@/components/MfaGate';

// Guarda separada de ProtectedRoute de propósito — não deve herdar nenhuma
// lógica de plano/trial (admin não é "mais um plano", é uma dimensão
// totalmente separada de permissão). Não expõe nenhum indício de que a rota
// existe pra quem não é admin: redireciona pro dashboard normal, mesma
// experiência de uma rota inexistente.
export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (authLoading || adminLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MfaGate>{children}</MfaGate>;
}
