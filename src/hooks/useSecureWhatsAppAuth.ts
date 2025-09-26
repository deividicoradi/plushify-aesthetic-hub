import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface WhatsAppTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface WhatsAppSession {
  id: string;
  user_id: string;
  session_id: string;
  status: string;
  qr_code?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  server_url?: string;
  last_activity: string;
}

export const useSecureWhatsAppAuth = () => {
  const { user, session } = useAuth();
  const [tokens, setTokens] = useState<WhatsAppTokens | null>(null);
  const [whatsappSession, setWhatsappSession] = useState<WhatsAppSession | null>(null);
  const [loading, setLoading] = useState(false);

  // Verificar se o token ainda é válido
  const isTokenValid = (): boolean => {
    if (!tokens) return false;
    const now = Date.now();
    const expiresAt = tokens.expires_at * 1000; // Converter para milliseconds
    return now < (expiresAt - 60000); // 1 minuto de margem
  };

  // Renovar token usando refresh_token
  const refreshAccessToken = async (): Promise<string | null> => {
    if (!tokens?.refresh_token) return null;

    try {
      const response = await fetch(`https://wmoylybbwikkqbxiqwbq.supabase.co/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb3lseWJid2lra3FieGlxd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzc3NTcsImV4cCI6MjA2MDk1Mzc1N30.Z0n_XICRbLX1kRT6KOWvFtV6a12r0pH3kW8HYtO6Ztw'
        },
        body: JSON.stringify({
          refresh_token: tokens.refresh_token
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao renovar token');
      }

      const data = await response.json();
      const newTokens: WhatsAppTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at
      };

      setTokens(newTokens);

      // Update tokens securely using refresh token rotation
      if (whatsappSession && user?.id) {
        const { error: rotateError } = await supabase.rpc('rotate_refresh_token', {
          p_old_token_hash: tokens.refresh_token, 
          p_user_id: user.id,
          p_new_token_hash: newTokens.refresh_token,
          p_new_encrypted_token: newTokens.refresh_token,
          p_session_id: whatsappSession.session_id
        });

        if (rotateError) {
          console.error('Error rotating tokens:', rotateError);
        }
      }

      return newTokens.access_token;
    } catch (error) {
      console.error('Erro ao renovar token:', error);
      toast({
        title: "Erro de Autenticação",
        description: "Sessão expirada. Faça login novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Obter token válido (renovar se necessário)
  const getValidToken = async (): Promise<string | null> => {
    if (!tokens) return null;

    if (isTokenValid()) {
      return tokens.access_token;
    }

    return await refreshAccessToken();
  };

  // Fazer login e capturar tokens com criptografia
  const loginWithCredentials = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch(`https://wmoylybbwikkqbxiqwbq.supabase.co/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indtb3lseWJid2lra3FieGlxd2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzc3NTcsImV4cCI6MjA2MDk1Mzc1N30.Z0n_XICRbLX1kRT6KOWvFtV6a12r0pH3kW8HYtO6Ztw'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      const newTokens: WhatsAppTokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at
      };

      setTokens(newTokens);

      // Create secure session without storing plaintext tokens
      const sessionId = `session_${user?.id}_${Date.now()}`;
      
      // Store tokens securely in whatsapp_refresh_tokens table
      const { error: tokenError } = await supabase.rpc('create_whatsapp_refresh_token', {
        p_user_id: user?.id,
        p_session_id: sessionId,
        p_refresh_token: newTokens.refresh_token,
        p_expires_at: new Date(newTokens.expires_at * 1000).toISOString()
      });

      if (tokenError) {
        console.error('Error storing secure tokens:', tokenError);
      }

      // Create session without plaintext tokens
      const { data: sessionData, error } = await supabase
        .from('whatsapp_sessions')
        .upsert({
          user_id: user?.id,
          session_id: sessionId,
          status: 'desconectado',
          server_url: import.meta.env.MODE === 'production' ? 'https://31.97.30.241:8787' : 'http://localhost:8787'
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      setWhatsappSession(sessionData);

      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro de Login",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Carregar sessão existente
  const loadSession = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setWhatsappSession(data);
        // Note: Tokens are now handled securely via whatsapp_refresh_tokens table
        // No longer storing plaintext tokens in whatsapp_sessions for security
        console.log('🔐 Session loaded successfully - using secure token storage');
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    }
  };

  // Rate limiting check
  const checkRateLimit = async (endpoint: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const windowStart = new Date();
      windowStart.setMinutes(windowStart.getMinutes() - 1); // Janela de 1 minuto

      const { data, error } = await supabase
        .from('whatsapp_rate_limits')
        .select('request_count')
        .eq('user_id', user.id)
        .eq('endpoint', endpoint)
        .gte('window_start', windowStart.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      const currentCount = data?.request_count || 0;
      const maxRequests = 30; // 30 requests por minuto

      if (currentCount >= maxRequests) {
        toast({
          title: "Rate Limit Excedido",
          description: "Muitas requisições. Aguarde um minuto.",
          variant: "destructive",
        });
        return false;
      }

      // Incrementar contador
      await supabase
        .from('whatsapp_rate_limits')
        .upsert({
          user_id: user.id,
          endpoint,
          request_count: currentCount + 1,
          window_start: new Date().toISOString()
        }, {
          onConflict: 'user_id,endpoint,window_start'
        });

      return true;
    } catch (error) {
      console.error('Erro no rate limiting:', error);
      return false;
    }
  };

  // Cleanup na desconexão do usuário
  const cleanup = async () => {
    if (whatsappSession?.user_id && user?.id) {
      await supabase
        .from('whatsapp_sessions')
        .update({ status: 'desconectado' })
        .eq('user_id', user.id);
    }
    setTokens(null);
    setWhatsappSession(null);
  };

  useEffect(() => {
    if (user && session) {
      loadSession();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [user, session]);

  return {
    tokens,
    whatsappSession,
    loading,
    isTokenValid,
    getValidToken,
    refreshAccessToken,
    loginWithCredentials,
    checkRateLimit,
    cleanup
  };
};