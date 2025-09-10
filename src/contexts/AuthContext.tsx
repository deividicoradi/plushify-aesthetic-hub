
// Integrar no AuthContext
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";
import { SessionWarningDialog } from '@/components/SessionWarningDialog';
import { useSentry } from '@/lib/sentry';
import { analytics } from '@/lib/analytics';


type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { setUserContext, addBreadcrumb, captureMessage } = useSentry();

  // Função para atualizar a sessão (removida para evitar refresh desnecessário)
  const refreshSession = async () => {
    console.log('Refresh session called - but skipping to avoid rate limits');
  };

  useEffect(() => {
    let mounted = true;
    
    // Configura o listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Adicionar contexto do usuário para Sentry
        if (session?.user) {
          setUserContext({
            id: session.user.id,
            email: session.user.email,
          });
          addBreadcrumb(`User ${event}`, 'auth', 'info');
          
          // Analytics: Rastrear login
          if (event === 'SIGNED_IN') {
            analytics.login();
          }
        } else {
          setUserContext({ id: '' });
          addBreadcrumb('User logged out', 'auth', 'info');
          
          // Analytics: Rastrear logout
          if (event === 'SIGNED_OUT') {
            analytics.logout();
          }
        }
      }
    );

    // Verifica se há uma sessão existente
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting initial session:', error);
          setSession(null);
          setUser(null);
        } else {
          console.log('Initial session check:', session?.user?.email);
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUserContext, addBreadcrumb]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso"
      });
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error.message);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  // Sistema de timeout de sessão integrado
  const [sessionState, setSessionState] = useState({
    timeRemaining: 30 * 60, // 30 minutos em segundos
    showWarning: false,
    lastActivity: new Date()
  });
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    if (!user) return;
    
    const now = new Date();
    setSessionState(prev => ({
      ...prev,
      lastActivity: now,
      timeRemaining: 30 * 60,
      showWarning: false
    }));
  }, [user]);

  // Auto logout por inatividade
  const handleAutoLogout = useCallback(async () => {
    toast({
      title: "Sessão Expirada",
      description: "Sessão expirou por inatividade",
      variant: "destructive"
    });
    await signOut();
  }, [toast]);

  // Verificar tempo de sessão
  const checkSessionTime = useCallback(() => {
    if (!user) return;

    const now = new Date();
    const timeSinceActivity = Math.floor((now.getTime() - sessionState.lastActivity.getTime()) / 1000);
    const remainingTime = (30 * 60) - timeSinceActivity;

    setSessionState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, remainingTime)
    }));

    // Mostrar aviso com 5 minutos restantes
    if (remainingTime <= 300 && remainingTime > 0 && !sessionState.showWarning) {
      setSessionState(prev => ({ ...prev, showWarning: true }));
      setShowWarningDialog(true);
    }

    // Logout se tempo esgotou
    if (remainingTime <= 0) {
      handleAutoLogout();
    }
  }, [user, sessionState.lastActivity, sessionState.showWarning, handleAutoLogout]);

  // Configurar listeners de atividade
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    intervalRef.current = setInterval(checkSessionTime, 30000); // Verificar a cada 30s

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, updateActivity, checkSessionTime]);

  const handleExtendSession = () => {
    updateActivity();
    setShowWarningDialog(false);
    toast({
      title: "Sessão Renovada",
      description: "Sessão renovada com sucesso"
    });
  };

  const handleSessionLogout = async () => {
    setShowWarningDialog(false);
    await signOut();
  };

  const formatTimeRemaining = () => {
    const minutes = Math.floor(sessionState.timeRemaining / 60);
    const seconds = sessionState.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionWarningDialog
        open={showWarningDialog}
        onExtend={handleExtendSession}
        onLogout={handleSessionLogout}
        timeRemaining={formatTimeRemaining()}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
