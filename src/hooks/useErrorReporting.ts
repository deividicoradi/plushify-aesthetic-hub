import { useCallback } from 'react';
import { useSentry } from '@/lib/sentry';
import { useToast } from '@/hooks/use-toast';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export const useErrorReporting = () => {
  const { captureException, captureMessage, addBreadcrumb } = useSentry();
  const { toast } = useToast();

  const reportError = useCallback((
    error: Error,
    context?: ErrorContext,
    showToast: boolean = true
  ) => {
    // Log local para desenvolvimento
    console.error('Error reported:', error, context);
    
    // Enviar para Sentry
    captureException(error, context);
    
    // Adicionar breadcrumb
    addBreadcrumb(
      `Error: ${error.message}`,
      context?.component || 'application',
      'error'
    );
    
    // Mostrar toast de erro para o usuário (opcional)
    if (showToast) {
      toast({
        title: "Algo deu errado",
        description: "Ocorreu um erro inesperado. Nossa equipe foi notificada.",
        variant: "destructive",
      });
    }
  }, [captureException, addBreadcrumb, toast]);

  const reportInfo = useCallback((
    message: string,
    context?: ErrorContext
  ) => {
    captureMessage(message, 'info');
    addBreadcrumb(message, context?.component || 'application', 'info');
  }, [captureMessage, addBreadcrumb]);

  const reportWarning = useCallback((
    message: string,
    context?: ErrorContext
  ) => {
    captureMessage(message, 'warning');
    addBreadcrumb(message, context?.component || 'application', 'warning');
  }, [captureMessage, addBreadcrumb]);

  return {
    reportError,
    reportInfo,
    reportWarning,
  };
};