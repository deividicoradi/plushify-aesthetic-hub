import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';


interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'xss_attempt' | 'unauthorized_access';
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userAgent?: string;
  url?: string;
  timestamp: Date;
}

export const useSecurityMonitor = () => {
  const { toast } = useToast();

  // Detectar tentativas de manipulação do DevTools
  const detectDevToolsUsage = useCallback(() => {
    let devtools = { open: false };
    
    setInterval(() => {
      const threshold = 160;
      
      if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          console.warn('[SECURITY] DevTools detectado');
        }
      } else {
        devtools.open = false;
      }
    }, 1000);
  }, []);

  // Desabilitar proteção do console temporariamente para melhorar performance
  const protectConsole = useCallback(() => {
    // Função desabilitada para reduzir overhead
    return;
  }, []);

  // Detectar tentativas de injeção de código
  const detectCodeInjection = useCallback((input: string): boolean => {
    const maliciousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /setTimeout\s*\(/gi,
      /setInterval\s*\(/gi,
      /document\.write/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,
      /insertAdjacentHTML/gi,
      /createElement\s*\(/gi,
      /appendChild/gi,
      /removeChild/gi,
      /replaceChild/gi
    ];

    const isInjection = maliciousPatterns.some(pattern => pattern.test(input));
    
    if (isInjection) {
      console.warn('[SECURITY] Tentativa de injeção de código detectada:', input.substring(0, 100));
      toast({
        title: "Tentativa de Injeção Detectada",
        description: "Código malicioso bloqueado",
        variant: "destructive"
      });
    }

    return isInjection;
  }, [toast]);

  // Detectar múltiplas tentativas de login falharam
  const detectBruteForce = useCallback((failedAttempts: number) => {
    if (failedAttempts >= 5) {
      console.warn('[SECURITY] Múltiplas tentativas de login detectadas:', failedAttempts);
      toast({
        title: "Atividade Suspeita",
        description: "Múltiplas tentativas de login detectadas. Conta temporariamente bloqueada.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Monitorar requisições anômalas
  const monitorNetworkRequests = useCallback(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async function(...args) {
      const [resource, options] = args;
      const url = typeof resource === 'string' ? resource : (resource instanceof Request ? resource.url : resource.toString());
      
      // Detectar requisições para domínios suspeitos
      const suspiciousDomains = [
        'evil.com',
        'malware.com',
        'phishing.com'
      ];
      
      const isSuspicious = suspiciousDomains.some(domain => url.includes(domain));
      
      if (isSuspicious) {
        console.warn('[SECURITY] Requisição bloqueada para domínio suspeito:', url);
        throw new Error('Requisição bloqueada por motivos de segurança');
      }
      
      return originalFetch.apply(window, args);
    };
  }, []);

  // Log de eventos de segurança
  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    console.warn('[SECURITY EVENT]', event);
    
    // Log detalhado para desenvolvimento
    if (import.meta.env.MODE === 'development') {
      console.table({
        Type: event.type,
        Severity: event.severity,
        Details: event.details,
        Timestamp: event.timestamp.toISOString()
      });
    }

    // Mostrar alerta para eventos críticos
    if (event.severity === 'critical' || event.severity === 'high') {
      toast({
        title: "Alerta de Segurança",
        description: event.details,
        variant: "destructive"
      });
    }
  }, [toast]);

  // Desabilitar inicialização automática para melhorar performance
  useEffect(() => {
    // Monitoramento desabilitado temporariamente
    return;
  }, []);

  return {
    detectCodeInjection,
    detectBruteForce,
    logSecurityEvent
  };
};