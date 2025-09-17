import React from 'react';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            Ocorreu um erro inesperado. Você pode tentar recarregar a página ou entrar em contato com o suporte.
          </p>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Recarregar página
            </Button>
            <Button 
              onClick={() => this.setState({ hasError: false })}
            >
              Tentar novamente
            </Button>
          </div>
          {import.meta.env.MODE === 'development' && this.state.error && (
            <details className="mt-4 text-left text-sm">
              <summary className="cursor-pointer">Detalhes do erro (desenvolvimento)</summary>
              <pre className="mt-2 p-2 bg-destructive/10 rounded text-xs overflow-auto">
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}