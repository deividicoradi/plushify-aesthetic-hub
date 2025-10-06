// Sistema de logs inteligente para debugging e produção
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;
  private isProduction = import.meta.env.MODE === 'production';

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogEntry['level'], message: string, context?: Record<string, any>, stack?: string) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
      stack
    };

    this.logs.push(entry);
    
    // Manter apenas os últimos logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Em desenvolvimento, sempre log no console
    if (!this.isProduction) {
      const prefix = `[${level.toUpperCase()}] ${entry.timestamp}`;
      switch (level) {
        case 'error':
          console.error(prefix, message, context || '', stack || '');
          break;
        case 'warn':
          console.warn(prefix, message, context || '');
          break;
        case 'debug':
          console.debug(prefix, message, context || '');
          break;
        default:
          console.log(prefix, message, context || '');
      }
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.addLog('info', message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.addLog('warn', message, context);
  }

  error(message: string, error?: Error | any, context?: Record<string, any>) {
    const stack = error?.stack || new Error().stack;
    this.addLog('error', message, { ...context, error: error?.message }, stack);
  }

  debug(message: string, context?: Record<string, any>) {
    this.addLog('debug', message, context);
  }

  // Verificação de dependências críticas
  checkReactVersions() {
    const reactVersion = (window as any).React?.version;
    const reactDOMVersion = (window as any).ReactDOM?.version;
    
    this.info('React Versions Check', {
      react: reactVersion,
      reactDOM: reactDOMVersion,
      multipleReact: !!(window as any).__REACT__,
      createRootAvailable: typeof window !== 'undefined' && 'createRoot' in (window as any)
    });

    if ((window as any).__REACT__ && reactVersion) {
      this.warn('Multiple React instances detected', {
        globalReact: reactVersion,
        windowReact: !!(window as any).__REACT__
      });
    }
  }

  // Verificar variáveis de ambiente críticas
  checkEnvironment() {
    const env = {
      supabaseUrl: true, // Configurado diretamente no código
      supabaseKey: true, // Configurado diretamente no código
      mode: import.meta.env.MODE || 'production',
      valid: true,
      sentryDsn: false // Não utilizado
    };

    this.info('Environment Check', env);
  }

  // Obter logs para debugging
  getLogs(level?: LogEntry['level']): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return [...this.logs];
  }

  // Limpar logs
  clearLogs() {
    this.logs = [];
    this.info('Logs cleared');
  }

  // Exportar logs para suporte
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Instância global
export const logger = new DebugLogger();

// Hook para usar em componentes
export const useLogger = () => logger;

// Inicializar verificações automáticas
if (typeof window !== 'undefined') {
  // Verificar após carregamento inicial
  setTimeout(() => {
    logger.checkReactVersions();
    logger.checkEnvironment();
  }, 1000);
}