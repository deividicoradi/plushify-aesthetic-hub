
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const LOVABLE_CLOUD_URL = 'https://iqpldxwwvnlloefqfhoo.supabase.co';
const LOVABLE_CLOUD_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxcGxkeHd3dm5sbG9lZnFmaG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MzE0NjcsImV4cCI6MjA5NjUwNzQ2N30.CC7iWCl_8tp0K_2lZxRvDTLjhYvn85Tn2WYLzOFS3qs';

const backendUrl = process.env.VITE_SUPABASE_URL || LOVABLE_CLOUD_URL;
const backendAnonKey =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  LOVABLE_CLOUD_ANON_KEY;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/",
  envPrefix: 'VITE_',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: true,
      clientPort: 8080,
    },
    watch: {
      usePolling: false,
    },
  },
  
  // Configurar source maps para produção (necessário para Sentry)
  build: {
    sourcemap: mode === 'production' ? 'hidden' : true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Configurar nomes de arquivo para cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name ? assetInfo.name.split('.') : [];
          const extType = info[info.length - 1];
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        }
      },
    },
    // Otimizações de build - Targeting modern browsers only for ES6+ support
    target: ['es2022', 'edge88', 'firefox100', 'chrome100', 'safari15'],
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // 4kb inline limit
    reportCompressedSize: false // Acelerar build
  },
  
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Deduplicate React to avoid multiple copies that break contexts/hooks
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react-dom/client'],
  },
  
  // Pré-empacotar deps e deduplicar React para evitar múltiplas cópias e erros de createContext
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-dom/client',
      'react/jsx-runtime',
      'react-router-dom', 
      '@tanstack/react-query', 
      '@supabase/supabase-js'
    ],
    exclude: ['@vite/client', '@vite/env'],
    esbuildOptions: {
      target: 'es2020'
    }
  },

  // Configurar variáveis de ambiente para diferentes modos
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || 'dev'),
    __BUILD_ID__: JSON.stringify(`${Date.now()}`),
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(backendUrl),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(backendAnonKey),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(backendAnonKey),
    'process.env.NODE_ENV': JSON.stringify(mode),
  },
  
  // Environment variables validation
  esbuild: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode)
    },
    drop: mode === 'production' ? ['console', 'debugger'] : []
  },
}));
