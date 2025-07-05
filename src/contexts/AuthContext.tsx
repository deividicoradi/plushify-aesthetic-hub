
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from "@/components/ui/sonner";
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { SessionWarningDialog } from '@/components/SessionWarningDialog';

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

  // Função para atualizar a sessão (removida para evitar refresh desnecessário)
  const refreshSession = async () => {
    console.log('Refresh session called - but skipping to avoid rate limits');
  };

  useEffect(() => {
    // Configura o listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Verifica se há uma sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Você saiu da sua conta com sucesso");
    } catch (error: any) {
      console.error('Erro ao fazer logout:', error.message);
      toast.error("Ocorreu um erro ao fazer logout");
    }
  };

  // Sistema de timeout de sessão - configuração para produção
  const sessionTimeout = useSessionTimeout({
    timeoutMinutes: 30,     // 30 minutos de inatividade
    warningMinutes: 5,      // Aviso 5 minutos antes
    checkIntervalSeconds: 30 // Verificar a cada 30 segundos
  });

  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // Controlar exibição do diálogo de aviso
  useEffect(() => {
    if (sessionTimeout.showWarning && user) {
      setShowWarningDialog(true);
    } else {
      setShowWarningDialog(false);
    }
  }, [sessionTimeout.showWarning, user]);

  const handleExtendSession = () => {
    sessionTimeout.extendSession();
    setShowWarningDialog(false);
  };

  const handleSessionLogout = async () => {
    setShowWarningDialog(false);
    await signOut();
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
        timeRemaining={sessionTimeout.formatTimeRemaining()}
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
