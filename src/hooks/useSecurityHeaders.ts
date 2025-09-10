import { useEffect } from 'react';

interface SecurityConfig {
  enableCSP?: boolean;
  enableXFrameOptions?: boolean;
  enableXContentTypeOptions?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
}

export const useSecurityHeaders = (config: SecurityConfig = {}) => {
  // Não manipular o DOM diretamente - os headers já estão definidos no index.html
  // Este hook agora apenas fornece funções utilitárias de segurança

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