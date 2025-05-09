
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

  // Redirect to dashboard if user tries to access login page while already authenticated
  if (user && (location.pathname === '/auth' || location.pathname === '/cadastro')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Get redirect path from URL if present
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect');
  
  // If not authenticated, redirect to auth page with the current location as redirect param
  if (!user) {
    return <Navigate to={`/auth${redirect ? `?redirect=${redirect}` : ''}`} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
