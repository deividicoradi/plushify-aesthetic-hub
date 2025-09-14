// Script to remove excessive console.logs in production
export const cleanupConsoleLogsInProduction = () => {
  if (import.meta.env.MODE === 'production') {
    // Override console methods in production
    const noop = () => {};
    
    // Keep only essential error logging
    console.log = noop;
    console.debug = noop;
    console.info = noop;
    
    // Keep warnings and errors for debugging
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      // Only log warnings that are not routine
      if (!args.some(arg => typeof arg === 'string' && 
        (arg.includes('🔍') || arg.includes('💰') || arg.includes('📊')))) {
        originalWarn.apply(console, args);
      }
    };
    
    console.error = (...args) => {
      // Always log errors but filter out routine ones
      if (!args.some(arg => typeof arg === 'string' && 
        (arg.includes('Analytics') && arg.includes('não configurado')))) {
        originalError.apply(console, args);
      }
    };
  }
};
