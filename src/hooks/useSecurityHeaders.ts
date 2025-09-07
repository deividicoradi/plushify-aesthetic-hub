import { useEffect } from 'react';

interface SecurityConfig {
  enableCSP?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
}

export const useSecurityHeaders = (config: SecurityConfig = {}) => {
  const {
    enableCSP = false, // Desabilitar por enquanto
    enableXFrameOptions = false, // Desabilitar por enquanto  
    enableXContentTypeOptions = false, // Desabilitar por enquanto
    enableReferrerPolicy = true,
    enablePermissionsPolicy = false // Desabilitar por enquanto
  } = config;

  useEffect(() => {
    // Content Security Policy (CSP)
    if (enableCSP) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://checkout.stripe.com https://*.supabase.co",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co https://checkout.stripe.com",
        "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://checkout.stripe.com",
        "frame-ancestors 'none'"
      ].join('; ');
      
      // Remover CSP existente se houver
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingCSP) {
        existingCSP.remove();
      }
      
      document.head.appendChild(meta);
    }

    // X-Frame-Options (proteção contra clickjacking)
    if (enableXFrameOptions) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Frame-Options';
      meta.content = 'DENY';
      document.head.appendChild(meta);
    }

    // X-Content-Type-Options (previne MIME sniffing)
    if (enableXContentTypeOptions) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'X-Content-Type-Options';
      meta.content = 'nosniff';
      document.head.appendChild(meta);
    }

    // Referrer Policy
    if (enableReferrerPolicy) {
      const meta = document.createElement('meta');
      meta.name = 'referrer';
      meta.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(meta);
    }

    // Permissions Policy (Feature Policy)
    if (enablePermissionsPolicy) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Permissions-Policy';
      meta.content = [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=(self)',
        'usb=()',
        'magnetometer=()',
        'accelerometer=()',
        'gyroscope=()'
      ].join(', ');
      document.head.appendChild(meta);
    }

    // Cleanup function para remover headers quando componente desmontar
    return () => {
      const headers = [
        'meta[http-equiv="Content-Security-Policy"]',
        'meta[http-equiv="X-Frame-Options"]',
        'meta[http-equiv="X-Content-Type-Options"]',
        'meta[name="referrer"]',
        'meta[http-equiv="Permissions-Policy"]'
      ];

      headers.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
          element.remove();
        }
      });
    };
  }, [enableCSP, enableXFrameOptions, enableXContentTypeOptions, enableReferrerPolicy, enablePermissionsPolicy]);

  // Função para validar e sanitizar URLs
  const sanitizeURL = (url: string): string => {
    try {
      const urlObj = new URL(url);
      
      // Permitir apenas protocolos seguros
      if (!['https:', 'http:', 'mailto:'].includes(urlObj.protocol)) {
        throw new Error('Protocolo não permitido');
      }

      // Remover parâmetros potencialmente perigosos
      const dangerousParams = ['javascript', 'vbscript', 'onload', 'onerror'];
      dangerousParams.forEach(param => {
        urlObj.searchParams.delete(param);
      });

      return urlObj.toString();
    } catch {
      // Se URL for inválida, retornar string vazia
      return '';
    }
  };

  // Função para validar entrada de dados
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remove iframes
      .replace(/javascript:/gi, '') // Remove javascript:
      .replace(/vbscript:/gi, '') // Remove vbscript:
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  };

  // Função para detectar tentativas de XSS
  const detectXSS = (input: string): boolean => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /<object[^>]*>/gi,
      /<embed[^>]*>/gi,
      /expression\s*\(/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  };

  return {
    sanitizeURL,
    sanitizeInput,
    detectXSS
  };
};