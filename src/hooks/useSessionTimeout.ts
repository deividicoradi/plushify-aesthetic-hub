import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SessionConfig {
  timeoutMinutes?: number;
  warningMinutes?: number;
  checkIntervalSeconds?: number;
}

interface SessionState {
  isActive: boolean;
  timeRemaining: number;
  showWarning: boolean;
  lastActivity: Date;
}

export const useSessionTimeout = (config: SessionConfig = {}) => {
  const {
    timeoutMinutes = 30, // 30 minutos padrão
    warningMinutes = 5,   // Aviso 5 minutos antes
    checkIntervalSeconds = 30 // Verificar a cada 30 segundos
  } = config;

  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [sessionState, setSessionState] = useState<SessionState>({
    isActive: !!user,
    timeRemaining: timeoutMinutes * 60,
    showWarning: false,
    lastActivity: new Date()
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);

  // Atualizar última atividade
  const updateActivity = useCallback(() => {
    if (!user) return;
    
    const now = new Date();
    setSessionState(prev => ({
      ...prev,
      lastActivity: now,
      timeRemaining: timeoutMinutes * 60,
      showWarning: false
    }));
    warningShownRef.current = false;
  }, [user, timeoutMinutes]);

  // Logout automático
  const handleAutoLogout = useCallback(async () => {
    toast({
      title: "Sessão Expirada",
      description: "Sua sessão expirou por inatividade. Faça login novamente.",
      variant: "destructive",
    });
    
    try {
      await signOut();
    } catch (error) {
      console.error('Erro no logout automático:', error);
    }
  }, [signOut, toast]);

  // Extender sessão
  const extendSession = useCallback(() => {
    updateActivity();
    toast({
      title: "Sessão Estendida",
      description: "Sua sessão foi renovada com sucesso.",
    });
  }, [updateActivity, toast]);

  // Verificar tempo restante da sessão
  const checkSessionTime = useCallback(() => {
    if (!user) return;

    const now = new Date();
    const timeSinceActivity = Math.floor((now.getTime() - sessionState.lastActivity.getTime()) / 1000);
    const remainingTime = (timeoutMinutes * 60) - timeSinceActivity;

    setSessionState(prev => ({
      ...prev,
      timeRemaining: Math.max(0, remainingTime)
    }));

    // Mostrar aviso se restam poucos minutos
    const warningThreshold = warningMinutes * 60;
    if (remainingTime <= warningThreshold && remainingTime > 0 && !warningShownRef.current) {
      warningShownRef.current = true;
      setSessionState(prev => ({ ...prev, showWarning: true }));
      
      toast({
        title: "Sessão Expirando",
        description: `Sua sessão expirará em ${Math.ceil(remainingTime / 60)} minutos.`,
        variant: "destructive",
      });
    }

    // Logout se tempo esgotou
    if (remainingTime <= 0) {
      handleAutoLogout();
    }
  }, [user, sessionState.lastActivity, timeoutMinutes, warningMinutes, handleAutoLogout, extendSession, toast]);

  // Configurar listeners de atividade
  useEffect(() => {
    if (!user) return;

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    const handleActivity = () => {
      updateActivity();
    };

    // Adicionar listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Configurar verificação periódica
    intervalRef.current = setInterval(checkSessionTime, checkIntervalSeconds * 1000);

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, updateActivity, checkSessionTime, checkIntervalSeconds]);

  // Inicializar quando usuário faz login
  useEffect(() => {
    if (user) {
      updateActivity();
      setSessionState(prev => ({
        ...prev,
        isActive: true
      }));
    } else {
      setSessionState(prev => ({
        ...prev,
        isActive: false,
        showWarning: false,
        timeRemaining: timeoutMinutes * 60
      }));
      warningShownRef.current = false;
    }
  }, [user, updateActivity, timeoutMinutes]);

  // Cleanup na desmontagem
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...sessionState,
    extendSession,
    updateActivity,
    formatTimeRemaining: () => {
      const minutes = Math.floor(sessionState.timeRemaining / 60);
      const seconds = sessionState.timeRemaining % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };
};