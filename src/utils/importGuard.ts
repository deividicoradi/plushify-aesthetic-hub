// Guard para prevenir importações circulares e conflitos de inicialização

interface ImportGuardConfig {
  maxDepth: number;
  knownCircularDeps: string[];
}

class ImportGuard {
  private static instance: ImportGuard | null = null;
  private importStack: string[] = [];
  private importMap: Map<string, Set<string>> = new Map();
  private config: ImportGuardConfig = {
    maxDepth: 10,
    knownCircularDeps: [
      'AuthContext',
      'SecurityProvider',
      'QueryClient',
      'WhatsAppIntegration'
    ]
  };

  static getInstance(): ImportGuard {
    if (!ImportGuard.instance) {
      ImportGuard.instance = new ImportGuard();
    }
    return ImportGuard.instance;
  }

  // Registrar início de importação
  startImport(moduleName: string): boolean {
    // Verificar profundidade da pilha
    if (this.importStack.length >= this.config.maxDepth) {
      console.error(`[IMPORT-GUARD] ❌ Import depth exceeded for ${moduleName}`);
      console.error(`[IMPORT-GUARD] Stack: ${this.importStack.join(' → ')}`);
      return false;
    }

    // Verificar dependência circular
    if (this.importStack.includes(moduleName)) {
      if (this.config.knownCircularDeps.includes(moduleName)) {
        console.warn(`[IMPORT-GUARD] ⚠️ Known circular dependency: ${moduleName}`);
        return true; // Permitir dependências circulares conhecidas
      } else {
        console.error(`[IMPORT-GUARD] ❌ Circular dependency detected: ${moduleName}`);
        console.error(`[IMPORT-GUARD] Stack: ${this.importStack.join(' → ')} → ${moduleName}`);
        return false;
      }
    }

    this.importStack.push(moduleName);
    console.debug(`[IMPORT-GUARD] Starting import: ${moduleName} (depth: ${this.importStack.length})`);
    return true;
  }

  // Registrar fim de importação
  endImport(moduleName: string): void {
    const lastModule = this.importStack.pop();
    if (lastModule !== moduleName) {
      console.warn(`[IMPORT-GUARD] ⚠️ Import stack mismatch: expected ${moduleName}, got ${lastModule}`);
    }
    console.debug(`[IMPORT-GUARD] Completed import: ${moduleName} (depth: ${this.importStack.length})`);
  }

  // Registrar dependência
  registerDependency(from: string, to: string): void {
    if (!this.importMap.has(from)) {
      this.importMap.set(from, new Set());
    }
    this.importMap.get(from)!.add(to);
  }

  // Detectar dependências circulares
  detectCircularDependencies(): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[] = [];

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart).concat([node]).join(' → ');
          cycles.push(cycle);
        }
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);

      const dependencies = this.importMap.get(node) || new Set();
      for (const dep of dependencies) {
        dfs(dep, [...path, node]);
      }

      recursionStack.delete(node);
    };

    for (const node of this.importMap.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  // Reset para hot reloads
  reset(): void {
    this.importStack = [];
    this.importMap.clear();
    console.log('[IMPORT-GUARD] 🔄 Reset completed');
  }

  // Debug info
  getDebugInfo(): object {
    return {
      currentStack: [...this.importStack],
      dependencyMap: Object.fromEntries(
        Array.from(this.importMap.entries()).map(([key, value]) => [key, Array.from(value)])
      ),
      circularDependencies: this.detectCircularDependencies()
    };
  }
}

// HOC para proteger importações
export const withImportGuard = <T>(
  moduleName: string,
  importFn: () => T
): T | null => {
  const guard = ImportGuard.getInstance();
  
  if (!guard.startImport(moduleName)) {
    return null;
  }

  try {
    const result = importFn();
    guard.endImport(moduleName);
    return result;
  } catch (error) {
    guard.endImport(moduleName);
    console.error(`[IMPORT-GUARD] ❌ Import failed for ${moduleName}:`, error);
    throw error;
  }
};

// Verificação automática em desenvolvimento
if (import.meta.env.MODE === 'development') {
  const guard = ImportGuard.getInstance();
  
  // Verificar a cada 5 segundos
  setInterval(() => {
    const cycles = guard.detectCircularDependencies();
    if (cycles.length > 0) {
      console.group('🔍 Circular Dependencies Detected');
      cycles.forEach(cycle => console.warn(cycle));
      console.groupEnd();
    }
  }, 5000);

  // Cleanup no hot reload
  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeFullReload', () => guard.reset());
  }
}

export default ImportGuard;