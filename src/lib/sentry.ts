import * as Sentry from "@sentry/react";
import React from 'react';

export const initSentry = () => {
  // Só inicializar em produção ou quando DSN estiver configurado
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    // console.log('Sentry DSN não configurado - Error reporting desabilitado');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      // Removido browserTracingIntegration para evitar conflitos com requisições customizadas
    ],
    
    // Performance Monitoring desabilitado para evitar interceptação de requisições
    tracesSampleRate: 0,
    
    // Configurações para melhor debugging
    beforeSend(event, hint) {
      // Filtrar erros conhecidos/esperados
      if (event.exception) {
        const error = hint.originalException as Error;
        
        // Filtrar erros de rede comum
        if (error?.message?.includes('NetworkError') || 
            error?.message?.includes('Failed to fetch')) {
          return null;
        }
        
        // Filtrar erros de extensões do browser
        if (error?.stack?.includes('extension://')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Capturar informações do usuário (sem dados sensíveis)
    initialScope: {
      tags: {
        app_version: import.meta.env.VITE_APP_VERSION || 'development',
      },
    },
  });
};

// Hook para usar o Sentry de forma opcional
export const useSentry = () => {
  const captureException = (error: Error, context?: Record<string, any>) => {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error, {
        contexts: { additional: context },
      });
    } else {
      console.error('Error captured locally:', error, context);
    }
  };

  const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureMessage(message, level);
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  };

  const setUserContext = (user: { id: string; email?: string }) => {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
      });
    }
  };

  const addBreadcrumb = (message: string, category: string = 'user', level: 'info' | 'warning' | 'error' = 'info') => {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        timestamp: Date.now() / 1000,
      });
    }
  };

  return {
    captureException,
    captureMessage,
    setUserContext,
    addBreadcrumb,
  };
};

// HOC para componentes com Sentry
export const withSentryErrorBoundary = (
  Component: React.ComponentType<any>
) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }: any) => (
      React.createElement('div', { 
        className: "min-h-screen bg-background flex items-center justify-center p-4" 
      },
        React.createElement('div', { 
          className: "max-w-md w-full bg-card border border-destructive/20 rounded-lg p-6 shadow-lg" 
        },
          React.createElement('div', { className: "text-center" },
            React.createElement('h2', { 
              className: "text-lg font-semibold text-foreground mb-2" 
            }, "Algo deu errado"),
            React.createElement('p', { 
              className: "text-sm text-muted-foreground mb-4" 
            }, "Ocorreu um erro inesperado. Nossa equipe foi notificada."),
            React.createElement('button', {
              onClick: resetError,
              className: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            }, "Tentar Novamente")
          )
        )
      )
    ),
    beforeCapture: (scope) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('component', {
        name: Component.displayName || Component.name,
      });
    },
  });
};