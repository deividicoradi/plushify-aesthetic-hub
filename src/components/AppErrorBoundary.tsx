import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

// ErrorBoundary específico para o App principal
export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const currentRoute = window.location.pathname;
    
    console.group('🚨 App Error Boundary - Critical App Failure');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Current Route:', currentRoute);
    console.error('Error ID:', this.state.errorId);
    console.error('User Agent:', navigator.userAgent);
    console.error('Timestamp:', new Date().toISOString());
    console.groupEnd();
    
    // Log evidência de captura
    console.log(`[ERROR_BOUNDARY] Erro capturado na rota ${currentRoute}: ${error.message}`);
    
    this.setState({
      error,
      errorInfo,
    });

    // Enviar para Sentry se disponível
    this.reportToSentry(error, errorInfo);
  }

  reportToSentry = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
      if (sentryDsn) {
        const Sentry = await import('@sentry/react');
        Sentry.captureException(error, {
          contexts: { 
            react: { 
              componentStack: errorInfo.componentStack 
            },
            app: {
              errorId: this.state.errorId,
              timestamp: new Date().toISOString()
            }
          },
          tags: {
            errorBoundary: 'app',
            critical: true
          }
        });
      }
    } catch (sentryError) {
      console.error('Failed to report to Sentry:', sentryError);
    }
  };

  handleRefresh = async () => {
    // Limpar storage local e caches para evitar estados inconsistentes
    try {
      console.log('[ERROR_BOUNDARY] Iniciando limpeza completa...');
      
      // Import cleanup utility
      const { clearAllAppData } = await import('@/utils/serviceWorkerCleanup');
      await clearAllAppData();
      
      console.log('[ERROR_BOUNDARY] Limpeza completa finalizada');
    } catch (e) {
      console.warn('Failed to clear app data:', e);
      // Fallback cleanup
      localStorage.clear();
      sessionStorage.clear();
    }
    
    window.location.reload();
  };

  handleGoHome = () => {
    // Tentar ir para home de forma segura
    try {
      window.location.href = '/';
    } catch (e) {
      window.location.reload();
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <div className="bg-card border border-destructive/20 rounded-lg p-6 shadow-lg">
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-destructive/10 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Aplicação com problemas
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Falha crítica na inicialização do aplicativo
                  </p>
                </div>
              </div>

              {/* Error Details */}
              {this.state.error && (
                <details className="mb-4 p-3 bg-muted rounded-md">
                  <summary className="flex items-center gap-2 cursor-pointer">
                    <Bug className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Detalhes do erro (ID: {this.state.errorId})
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Mensagem:</span>
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Stack:</span>
                        <pre className="text-xs text-muted-foreground overflow-auto max-h-32 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tentar Novamente
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={this.handleRefresh}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Recarregar
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-md hover:bg-accent transition-colors text-sm"
                  >
                    <Home className="h-4 w-4" />
                    Início
                  </button>
                </div>
              </div>

              {/* Support Info */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Se o problema persistir, reporte o erro ID: <strong>{this.state.errorId}</strong>
                  <br />
                  Contato: <a href="mailto:suporte@plushify.com" className="text-primary hover:underline">
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