
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
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
    VitePWA({
      registerType: 'prompt',
      injectRegister: null, // Gerenciado manualmente pelo swManager
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt', 'lovable-uploads/2c6a89a0-0e82-4a31-b0cf-c233fc3cad6c.png'],
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      manifest: {
        name: 'Plushify - Plataforma para Profissionais de Estética',
        short_name: 'Plushify',
        description: 'Gerencie agendamentos, clientes, pagamentos, serviços, relatórios financeiros e programa de fidelidade',
        theme_color: '#D65E9A',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        categories: ['business', 'productivity', 'medical'],
        icons: [
          {
            src: '/lovable-uploads/2c6a89a0-0e82-4a31-b0cf-c233fc3cad6c.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/lovable-uploads/2c6a89a0-0e82-4a31-b0cf-c233fc3cad6c.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff,ttf,eot}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        cleanupOutdatedCaches: true,
        skipWaiting: false, // NÃO forçar skip waiting automaticamente
        clientsClaim: false, // NÃO tentar claim automaticamente (causa erro)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          // API Cache Strategy
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 5 // 5 minutes
              }
            }
          },
          // Static Assets Cache
          {
            urlPattern: /^https:\/\/.*\.(js|css|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          // Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // Images Cache
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false, // Desabilitar PWA em desenvolvimento
        suppressWarnings: true,
        type: 'module'
      }
    })
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
