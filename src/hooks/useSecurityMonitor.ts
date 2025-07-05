import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuditLog } from '@/hooks/useAuditLog';

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
  const { createAuditLog } = useAuditLog();

  // Detectar tentativas de manipulação do DevTools
  const detectDevToolsUsage = useCallback(() => {
    let devtools = { open: false };
    
    setInterval(() => {
      const threshold = 160;
      
      if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devtools.open) {
          devtools.open = true;
          logSecurityEvent({
            type: 'suspicious_activity',
            details: 'DevTools aberto detectado',
            severity: 'low',
            userAgent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date()
          });
        }
      } else {
        devtools.open = false;
      }
    }, 1000);
  }, []);

  // Detectar tentativas de modificação do console
  const protectConsole = useCallback(() => {
    if (process.env.NODE_ENV === 'production') {
      // Sobrescrever funções do console em produção
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = function(...args) {
        logSecurityEvent({
          type: 'suspicious_activity',
          details: `Console.log executado: ${args.join(' ')}`,
          severity: 'low',
          timestamp: new Date()
        });
        return originalLog.apply(console, args);
      };

      console.error = function(...args) {
        logSecurityEvent({
          type: 'suspicious_activity',
          details: `Console.error executado: ${args.join(' ')}`,
          severity: 'medium',
          timestamp: new Date()
        });
        return originalError.apply(console, args);
      };

      console.warn = function(...args) {
        logSecurityEvent({
          type: 'suspicious_activity',
          details: `Console.warn executado: ${args.join(' ')}`,
          severity: 'low',
          timestamp: new Date()
        });
        return originalWarn.apply(console, args);
      };
    }
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
      logSecurityEvent({
        type: 'xss_attempt',
        details: `Tentativa de injeção de código detectada: ${input.substring(0, 100)}...`,
        severity: 'high',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date()
      });
    }

    return isInjection;
  }, []);

  // Detectar múltiplas tentativas de login falharam
  const detectBruteForce = useCallback((failedAttempts: number) => {
    if (failedAttempts >= 5) {
      logSecurityEvent({
        type: 'suspicious_activity',
        details: `Múltiplas tentativas de login falharam: ${failedAttempts}`,
        severity: 'high',
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date()
      });

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
        logSecurityEvent({
          type: 'suspicious_activity',
          details: `Requisição para domínio suspeito: ${url}`,
          severity: 'critical',
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date()
        });
        
        throw new Error('Requisição bloqueada por motivos de segurança');
      }
      
      return originalFetch.apply(window, args);
    };
  }, []);

  // Log de eventos de segurança
  const logSecurityEvent = useCallback(async (event: SecurityEvent) => {
    console.warn('[SECURITY EVENT]', event);
    
    // Registrar no sistema de auditoria
    try {
      await createAuditLog({
        action: 'UPDATE',
        tableName: 'security_monitor',
        recordId: 'security-event-' + Date.now(),
        newData: {
          type: event.type,
          details: event.details,
          severity: event.severity,
          userAgent: event.userAgent,
          url: event.url,
          timestamp: event.timestamp.toISOString()
        }
      });
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
    }

    // Mostrar alerta para eventos críticos
    if (event.severity === 'critical' || event.severity === 'high') {
      toast({
        title: "Alerta de Segurança",
        description: event.details,
        variant: "destructive"
      });
    }
  }, [createAuditLog, toast]);

  // Inicializar monitoramento
  useEffect(() => {
    if (typeof window !== 'undefined') {
      detectDevToolsUsage();
      protectConsole();
      monitorNetworkRequests();
    }
  }, [detectDevToolsUsage, protectConsole, monitorNetworkRequests]);

  return {
    detectCodeInjection,
    detectBruteForce,
    logSecurityEvent
  };
};