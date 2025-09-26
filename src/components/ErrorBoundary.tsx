import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSentry } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualiza o state para mostrar a UI de erro
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Log detalhado para desenvolvimento
    console.group('🚨 Error Boundary - Detailed Error Log');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Stack Trace:', error.stack);
    console.groupEnd();

    // Enviar para Sentry se configurado
    try {
      import('@/lib/sentry').then(({ useSentry }) => {
        // Não podemos usar hooks em class components, então usamos diretamente
        if (import.meta.env.VITE_SENTRY_DSN) {
          import('@sentry/react').then((Sentry) => {
            Sentry.captureException(error, {
              contexts: { 
                react: { 
                  componentStack: errorInfo.componentStack 
                } 
              },
              tags: {
                errorBoundary: true,
              }
            });
          });
        }
      });
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError);
    }
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    // Verificar se o usuário está autenticado usando diferentes métodos
    const checkAuthentication = () => {
      // Verificar tokens no storage
      const localToken = localStorage.getItem('supabase.auth.token');
      const sessionToken = sessionStorage.getItem('supabase.auth.token');
      
      // Verificar a presença da sessão atual do Supabase
      const supabaseSession = localStorage.getItem('sb-wmoylybbwikkqbxiqwbq-auth-token');
      
      return !!(localToken || sessionToken || supabaseSession);
    };
    
    const isAuthenticated = checkAuthentication();
    
    if (isAuthenticated) {
      // Se autenticado, ir para o dashboard
      window.location.href = '/dashboard';
    } else {
      // Se não autenticado, ir para home
      window.location.href = '/';
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de erro padrão
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-card border border-destructive/20 rounded-lg p-6 shadow-lg">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Algo deu errado
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Ocorreu um erro inesperado na aplicação
                  </p>
                </div>
              </div>

              {/* Error Details (apenas em desenvolvimento) */}
              {this.state.error && (
                <details className="mb-4 p-3 bg-muted rounded-md">
                  <summary className="flex items-center gap-2 cursor-pointer">
                    <Bug className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Detalhes técnicos
                    </span>
                  </summary>
                  <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}


              {/* Actions */}
              <div className="space-y-2">
                <Button 
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={this.handleRefresh}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recarregar
                  </Button>
                  
                  <Button 
                    onClick={this.handleGoHome}
                    variant="outline"
                    size="sm"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Button>
                </div>
              </div>

              {/* Support Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Se o problema persistir, entre em contato com o suporte em{' '}
                  <a 
                    href="mailto:suporte@plushify.com" 
                    className="text-primary hover:underline"
                  >
                    suporte@plushify.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC para envolver componentes específicos
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook para capturar erros em componentes funcionais
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: string) => {
    console.error('Handled Error:', error);
    
    // Em produção, enviar para serviço de monitoramento
    if (import.meta.env.MODE === 'production') {
      // Implementar integração com Sentry aqui
    }
  };

  return { handleError };
};