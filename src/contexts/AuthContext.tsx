
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from "@/components/ui/sonner";

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

  // Interval handler used to refresh the token periodically
  let tokenRefreshInterval: ReturnType<typeof setInterval> | undefined;

  // Função para atualizar a sessão
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setSession(data.session);
      setUser(data.session?.user ?? null);
    } catch (error: any) {
      console.error('Erro ao atualizar sessão:', error.message);
      // Se não for possível atualizar a sessão, faça logout
      if (error.message.includes('Token expired') || error.message.includes('Invalid token')) {
        await signOut();
        toast.error("Sua sessão expirou. Por favor, faça login novamente.");
      }
    }
  };

  useEffect(() => {
    // Configura o listener para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Quando o evento é SIGNED_IN, verifica se houve atualização do usuário
        if (event === 'SIGNED_IN') {
          try {
            // Atualiza informações do usuário se necessário
            if (session?.user?.id) {
              // Código para atualizar informações adicionais do usuário se necessário
            }
          } catch (error) {
            console.error('Erro ao atualizar dados do usuário:', error);
          }
        }
      }
    );

    // Verifica se há uma sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Configura um intervalo para renovar o token periodicamente (a cada 55 minutos)
      tokenRefreshInterval = setInterval(refreshSession, 55 * 60 * 1000);
    });

    return () => {
      subscription.unsubscribe();
      if (tokenRefreshInterval) clearInterval(tokenRefreshInterval);
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

  const value = {
    user,
    session,
    loading,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
