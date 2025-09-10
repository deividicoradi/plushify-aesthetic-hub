import React, { createContext, useContext, ReactNode } from 'react';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useRateLimit } from '@/hooks/useRateLimit';

interface SecurityContextType {
  sanitizeURL: (url: string) => string;
  sanitizeInput: (input: string) => string;
  detectXSS: (input: string) => boolean;
  detectCodeInjection: (input: string) => boolean;
  detectBruteForce: (attempts: number) => void;
  loginRateLimit: ReturnType<typeof useRateLimit>;
  apiRateLimit: ReturnType<typeof useRateLimit>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  // Configurar headers de segurança - headers já definidos no index.html
  const { sanitizeURL, sanitizeInput, detectXSS } = useSecurityHeaders();

  // Configurar monitoramento de segurança
  const { detectCodeInjection, detectBruteForce } = useSecurityMonitor();

  // Rate limiting para login (5 tentativas por 15 minutos)
  const loginRateLimit = useRateLimit({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    skipSuccessfulRequests: true
  });

  // Rate limiting para API (100 requests por minuto)
  const apiRateLimit = useRateLimit({
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Limite de requisições excedido. Aguarde um minuto.',
    skipSuccessfulRequests: false
  });

  const value: SecurityContextType = {
    sanitizeURL,
    sanitizeInput,
    detectXSS,
    detectCodeInjection,
    detectBruteForce,
    loginRateLimit,
    apiRateLimit
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity deve ser usado dentro de um SecurityProvider');
  }
  return context;
};