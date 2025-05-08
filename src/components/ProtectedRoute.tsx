
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    if (!loading) setIsLoading(false);
  }, [loading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-plush-600"></div>
      </div>
    );
  }

  // Redireciona para o dashboard se o usuário tentar acessar a página de login estando já autenticado
  if (user && (location.pathname === '/auth' || location.pathname === '/cadastro')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;

  return <>{children}</>;
}
