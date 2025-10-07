
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { setUserContext, addBreadcrumb } = useSentry();
  const navigate = useNavigate();
  
  // Ref para garantir apenas uma subscription ativa
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const initializedRef = useRef(false);
  const lastEventRef = useRef<{ event: string; timestamp: number } | null>(null);

  // De-duplicação de eventos dentro de 1 segundo
  const isDuplicateEvent = (event: string): boolean => {
    const now = Date.now();
    if (lastEventRef.current && 
        lastEventRef.current.event === event && 
        now - lastEventRef.current.timestamp < 1000) {
      return true;
    }
    lastEventRef.current = { event, timestamp: now };
    return false;
  };

  // Função para atualizar a sessão (removida para evitar refresh desnecessário)
  const refreshSession = async () => {
    console.log('Refresh session called - but skipping to avoid rate limits');
  };

  useEffect(() => {
    // Prevenir múltiplas inicializações
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    let mounted = true;
    
    // 1. PRIMEIRO: Obter sessão inicial
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (error) {
          console.error('[AUTH] Error getting initial session:', error);
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Atualizar estado inicial (sem log repetitivo)
        if (initialSession?.user) {
          console.log('[AUTH] Initial session loaded');
          setSession(initialSession);
          setUser(initialSession.user);
          setUserContext({
            id: initialSession.user.id,
            email: initialSession.user.email,
          });
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
        
      } catch (error) {
        console.error('[AUTH] Error in initialization:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    };
    
    // 2. DEPOIS: Registrar listener para mudanças futuras (apenas uma vez)
    if (!subscriptionRef.current) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, newSession) => {
          if (!mounted) return;
          
          // Ignorar INITIAL_SESSION (já tratado acima)
          if (event === 'INITIAL_SESSION') return;
          
          // Ignorar eventos duplicados dentro de 1 segundo
          if (isDuplicateEvent(event)) {
            console.log('[AUTH] Duplicate event ignored:', event);
            return;
          }
          
          console.log('[AUTH] Event:', event);
          
          setSession(newSession);
          setUser(newSession?.user ?? null);
          
          // Sentry e Analytics apenas para eventos reais
          if (newSession?.user) {
            setUserContext({
              id: newSession.user.id,
              email: newSession.user.email,
            });
            addBreadcrumb(`User ${event}`, 'auth', 'info');
            
            if (event === 'SIGNED_IN') {
              analytics.login();
            }
          } else {
            setUserContext({ id: '' });
            addBreadcrumb('User logged out', 'auth', 'info');
            
            if (event === 'SIGNED_OUT') {
              analytics.logout();
            }
          }
        }
      );
      
      subscriptionRef.current = subscription;
    }
    
    // Inicializar
    initializeAuth();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        console.log('[AUTH] Cleanup: unsubscribing');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      initializedRef.current = false;
    };
  }, []); // Sem dependências - roda apenas uma vez

  const signOut = useCallback(async () => {
    try {
      // 1. Limpar estado local primeiro (instantâneo)
      setSession(null);
      setUser(null);
      setUserContext({ id: '' });
      
      // 2. Navegar imediatamente (não espera o Supabase)
      navigate('/auth', { replace: true });
      
      // 3. Mostrar toast
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso"
      });
      
      // 4. Fazer signOut do Supabase em background
      supabase.auth.signOut().catch(error => {
        console.error('Erro ao fazer logout no Supabase:', error);
      });
      
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error.message);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer logout",
        variant: "destructive"
      });
    }
  }, [navigate, toast, setUserContext]);

  // Sistema de timeout de sessão integrado
  const [sessionState, setSessionState] = useState({
    timeRemaining: 30 * 60, // 30 minutos em segundos
    showWarning: false,
    lastActivity: new Date()
  });
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Atualizar última atividade - FIX: callback estável sem dependência de user
  const updateActivity = useCallback(() => {
    setSessionState(prev => {
      // Se não temos sessão, não atualizar
      if (!prev.lastActivity) return prev;
      
      const now = new Date();
      return {
        ...prev,
        lastActivity: now,
        timeRemaining: 30 * 60,
        showWarning: false
      };
    });
  }, []); // Sem dependências para evitar re-criação

  // Auto logout por inatividade
  const handleAutoLogout = useCallback(async () => {
    toast({
      title: "Sessão Expirada",
      description: "Sessão expirou por inatividade",
      variant: "destructive"
    });
    await signOut();
  }, [toast]);

  // Verificar tempo de sessão - FIX: callback estável sem dependência de user
  const checkSessionTime = useCallback(() => {
    setSessionState(prev => {
      // Se não temos sessão ativa, não verificar
      if (!prev.lastActivity) return prev;
      
      const now = new Date();
      const timeSinceActivity = Math.floor((now.getTime() - prev.lastActivity.getTime()) / 1000);
      const remainingTime = (30 * 60) - timeSinceActivity;

      // Mostrar aviso com 5 minutos restantes
      if (remainingTime <= 300 && remainingTime > 0 && !prev.showWarning) {
        setShowWarningDialog(true);
        return {
          ...prev,
          timeRemaining: Math.max(0, remainingTime),
          showWarning: true
        };
      }

      // Logout se tempo esgotou
      if (remainingTime <= 0) {
        handleAutoLogout();
      }

      return {
        ...prev,
        timeRemaining: Math.max(0, remainingTime)
      };
    });
  }, [handleAutoLogout]); // Apenas handleAutoLogout como dependência

  // Configurar listeners de atividade - FIX: remover dependência de user para evitar loop
  useEffect(() => {
    if (!user) {
      // Limpar se não há usuário
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

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
  }, [user?.id, updateActivity, checkSessionTime]); // Usar user?.id ao invés de user completo

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
