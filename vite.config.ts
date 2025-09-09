
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  
  // Configurar source maps para produção (necessário para Sentry)
  build: {
    sourcemap: mode === 'production' ? 'hidden' : true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Optimize chunk splitting for better loading performance
          if (id.includes('node_modules')) {
            if (id.includes('@sentry')) return 'sentry';
            if (id.includes('react') && !id.includes('react-router')) return 'vendor';
            if (id.includes('react-router')) return 'router';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('@radix-ui')) return 'ui';
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) return 'utils';
            if (id.includes('@tanstack/react-query')) return 'query';
            return 'vendor-misc';
          }
          // Separate dashboard and financial components
          if (id.includes('/dashboard/') || id.includes('/financial/')) return 'dashboard';
          if (id.includes('/auth/')) return 'auth';
        },
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
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'robots.txt', 'lovable-uploads/2c6a89a0-0e82-4a31-b0cf-c233fc3cad6c.png'],
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
        skipWaiting: true,
        clientsClaim: true,
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
        enabled: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Configurar variáveis de ambiente para diferentes modos
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || 'dev'),
  },
}));
