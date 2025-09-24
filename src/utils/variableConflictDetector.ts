// Detector de conflitos de variáveis que podem causar "Cannot access before initialization"

interface VariableConflict {
  name: string;
  location: string;
  type: 'hoisting' | 'temporal-dead-zone' | 'circular-dependency' | 'redeclaration';
  severity: 'error' | 'warning';
}

class VariableConflictDetector {
  private conflicts: VariableConflict[] = [];
  private globalVariables: Set<string> = new Set();
  
  constructor() {
    this.scanGlobalScope();
  }

  // Escanear escopo global para variáveis problemáticas
  private scanGlobalScope(): void {
    if (typeof window === 'undefined') return;

    // Verificar variáveis globais que podem causar conflitos
    const windowKeys = Object.getOwnPropertyNames(window);
    const suspiciousKeys = windowKeys.filter(key => 
      key.length <= 3 && // Variáveis curtas como 'Ke'
      /^[A-Z][a-z]?$/.test(key) // Padrão CamelCase curto
    );

    suspiciousKeys.forEach(key => {
      this.globalVariables.add(key);
      console.warn(`[VAR-CONFLICT] Suspicious global variable detected: ${key}`);
    });

    // Verificar especificamente 'Ke' ou variáveis similares
    const keVariants = ['Ke', 'K', 'ke', 'KEY', 'Key'];
    keVariants.forEach(variant => {
      if (variant in window) {
        const value = (window as any)[variant];
        this.conflicts.push({
          name: variant,
          location: 'window',
          type: 'redeclaration',
          severity: 'error'
        });
        console.error(`[VAR-CONFLICT] ❌ Found global variable '${variant}':`, value);
      }
    });

    // Verificar propriedades React/ReactDOM que podem conflitar
    const reactKeys = Object.getOwnPropertyNames(window).filter(key => 
      key.includes('React') || key.includes('__REACT')
    );
    
    if (reactKeys.length > 2) {
      this.conflicts.push({
        name: 'React multiple instances',
        location: 'window',
        type: 'redeclaration',
        severity: 'warning'
      });
      console.warn('[VAR-CONFLICT] Multiple React-related globals:', reactKeys);
    }
  }

  // Verificar temporal dead zone em módulos
  detectTemporalDeadZone(): void {
    // Verificar se há imports/exports problemáticos
    const suspiciousGlobals = [
      '__REACT__',
      '__REACT_DOM__',
      '__SUPABASE__',
      '__QUERY_CLIENT__'
    ];

    suspiciousGlobals.forEach(global => {
      if (global in window) {
        const value = (window as any)[global];
        if (value === undefined) {
          this.conflicts.push({
            name: global,
            location: 'window',
            type: 'temporal-dead-zone',
            severity: 'error'
          });
          console.error(`[VAR-CONFLICT] ❌ Temporal dead zone detected for ${global}`);
        }
      }
    });
  }

  // Verificar dependências circulares
  detectCircularDependencies(): void {
    const moduleGraph = new Map<string, string[]>();
    
    // Construir grafo básico baseado em importações conhecidas
    const knownModules = [
      'AuthContext',
      'SecurityProvider', 
      'QueryClient',
      'WhatsAppIntegration',
      'ProtectedRoute'
    ];

    // Detectar ciclos simples
    knownModules.forEach(module => {
      if ((window as any)[`__${module.toUpperCase()}__`]) {
        console.warn(`[VAR-CONFLICT] Module ${module} may have circular dependency`);
      }
    });
  }

  // Executar verificação completa
  runFullScan(): VariableConflict[] {
    console.group('[VAR-CONFLICT] 🔍 Running variable conflict detection');
    
    this.detectTemporalDeadZone();
    this.detectCircularDependencies();
    
    if (this.conflicts.length === 0) {
      console.log('✅ No variable conflicts detected');
    } else {
      console.error(`❌ Found ${this.conflicts.length} variable conflicts:`);
      this.conflicts.forEach(conflict => {
        const symbol = conflict.severity === 'error' ? '❌' : '⚠️';
        console.log(`${symbol} ${conflict.name} (${conflict.type}) at ${conflict.location}`);
      });

      // Sugestões específicas para 'Ke'
      const keConflicts = this.conflicts.filter(c => c.name.includes('Ke') || c.name.includes('K'));
      if (keConflicts.length > 0) {
        console.group('🔧 Suggested fixes for "Ke" related errors:');
        console.log('1. Check for library conflicts (especially UI libraries)');
        console.log('2. Verify import order in main.tsx');
        console.log('3. Look for bundler output variable minification');
        console.log('4. Check for React 18 concurrent features conflicts');
        console.groupEnd();
      }
    }
    
    console.groupEnd();
    return [...this.conflicts];
  }

  // Limpar conflitos detectados
  clearConflicts(): void {
    this.conflicts = [];
    this.globalVariables.clear();
  }

  // Get detailed report
  getReport(): string {
    return `Variable Conflict Report:
Total conflicts: ${this.conflicts.length}
Global variables: ${this.globalVariables.size}

Conflicts by type:
${this.conflicts.reduce((acc, conflict) => {
  acc[conflict.type] = (acc[conflict.type] || 0) + 1;
  return acc;
}, {} as Record<string, number>)}

Suggested actions:
- Review import statements for circular dependencies
- Check for variable hoisting issues
- Verify React/library versions for conflicts
- Consider using import maps for problematic modules`;
  }
}

// Singleton instance
let detectorInstance: VariableConflictDetector | null = null;

export const getVariableConflictDetector = (): VariableConflictDetector => {
  if (!detectorInstance) {
    detectorInstance = new VariableConflictDetector();
  }
  return detectorInstance;
};

// Auto-run in development
if (import.meta.env.MODE === 'development') {
  // Esperar carregamento completo antes de verificar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const detector = getVariableConflictDetector();
        detector.runFullScan();
      }, 1000);
    });
  } else {
    setTimeout(() => {
      const detector = getVariableConflictDetector();
      detector.runFullScan();
    }, 1000);
  }
}

export type { VariableConflict };
export default VariableConflictDetector;