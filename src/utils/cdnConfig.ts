// CDN Configuration and Asset Optimization
export interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheHeaders: Record<string, string>;
  optimizations: {
    images: boolean;
    css: boolean;
    js: boolean;
    fonts: boolean;
  };
}

// CDN Providers Configuration
export const CDN_PROVIDERS = {
  cloudflare: {
    baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs',
    regions: ['global'],
    cacheHeaders: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'max-age=31536000'
    }
  },
  jsdelivr: {
    baseUrl: 'https://cdn.jsdelivr.net',
    regions: ['global', 'fastly', 'gcore'],
    cacheHeaders: {
      'Cache-Control': 'public, max-age=31536000',
      'CDN-Cache-Control': 'max-age=31536000'
    }
  },
  unpkg: {
    baseUrl: 'https://unpkg.com',
    regions: ['global'],
    cacheHeaders: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
} as const;

// Asset Cache Configuration
export const CACHE_STRATEGIES = {
  // Static assets - Cache first, long TTL
  static: {
    strategy: 'CacheFirst' as const,
    maxAge: 60 * 60 * 24 * 365, // 1 year
    maxEntries: 200,
    patterns: [/\.(js|css|png|jpg|jpeg|svg|gif|woff2?|ttf|eot)$/i]
  },
  
  // API responses - Network first, short TTL
  api: {
    strategy: 'NetworkFirst' as const,
    maxAge: 60 * 5, // 5 minutes
    maxEntries: 100,
    patterns: [/\/api\//, /supabase\.co/]
  },
  
  // HTML pages - Stale while revalidate
  pages: {
    strategy: 'StaleWhileRevalidate' as const,
    maxAge: 60 * 60, // 1 hour
    maxEntries: 50,
    patterns: [/\.html$/, /\/$/, /\/[^.]*$/]
  },
  
  // Images - Cache first with compression
  images: {
    strategy: 'CacheFirst' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    maxEntries: 100,
    patterns: [/\.(png|jpg|jpeg|gif|webp|avif|svg|ico)$/i]
  }
} as const;

// Generate optimized asset URLs
export const generateAssetUrl = (
  assetPath: string, 
  provider: keyof typeof CDN_PROVIDERS = 'jsdelivr',
  optimizations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  }
): string => {
  const cdnConfig = CDN_PROVIDERS[provider];
  let url = `${cdnConfig.baseUrl}${assetPath}`;
  
  // Add image optimizations if supported and provided
  if (optimizations && provider === 'jsdelivr') {
    const params = new URLSearchParams();
    
    if (optimizations.width) params.set('w', optimizations.width.toString());
    if (optimizations.height) params.set('h', optimizations.height.toString());
    if (optimizations.quality) params.set('q', optimizations.quality.toString());
    if (optimizations.format) params.set('f', optimizations.format);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
  }
  
  return url;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    // Preload critical CSS
    { href: '/assets/css/index.css', as: 'style' },
    // Preload critical JS
    { href: '/assets/js/main.js', as: 'script' },
    // Preload critical fonts
    { href: '/assets/fonts/inter-var.woff2', as: 'font', type: 'font/woff2', crossorigin: 'anonymous' }
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.type) link.type = resource.type;
    if (resource.crossorigin) link.crossOrigin = resource.crossorigin;
    
    document.head.appendChild(link);
  });
};

// DNS prefetch for external domains
export const setupDNSPrefetch = () => {
  const domains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'unpkg.com',
    'supabase.co'
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });
};

// Resource hints for better performance
export const setupResourceHints = () => {
  // DNS prefetch
  setupDNSPrefetch();
  
  // Preconnect to critical origins
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Cache management utilities
export const getCacheHeaders = (assetType: string): Record<string, string> => {
  const baseHeaders = {
    'Cache-Control': 'public',
    'Vary': 'Accept-Encoding'
  };
  
  switch (assetType) {
    case 'static':
      return {
        ...baseHeaders,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': `"${Date.now()}"`,
        'Last-Modified': new Date().toUTCString()
      };
      
    case 'api':
      return {
        ...baseHeaders,
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'Vary': 'Accept-Encoding, Authorization'
      };
      
    case 'html':
      return {
        ...baseHeaders,
        'Cache-Control': 'public, max-age=3600, must-revalidate'
      };
      
    default:
      return baseHeaders;
  }
};

// Performance monitoring for CDN
export interface CDNMetrics {
  loadTime: number;
  cacheHit: boolean;
  provider: string;
  assetSize: number;
  errorRate: number;
}

export const trackCDNPerformance = (url: string, startTime: number): CDNMetrics => {
  const endTime = performance.now();
  const loadTime = endTime - startTime;
  
  // Detect CDN provider from URL
  const provider = Object.keys(CDN_PROVIDERS).find(key => 
    url.includes(CDN_PROVIDERS[key as keyof typeof CDN_PROVIDERS].baseUrl)
  ) || 'unknown';
  
  return {
    loadTime,
    cacheHit: loadTime < 100, // Assume cache hit if very fast
    provider,
    assetSize: 0, // Would need to be measured
    errorRate: 0
  };
};

// Initialize CDN and cache optimizations
export const initializeCDNOptimizations = () => {
  // Set up resource hints
  setupResourceHints();
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Monitor performance
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track CDN performance
          if (resourceEntry.name.includes('cdn') || resourceEntry.name.includes('cloudflare')) {
            console.log('CDN Performance:', {
              url: resourceEntry.name,
              loadTime: resourceEntry.duration,
              cacheHit: resourceEntry.transferSize === 0
            });
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
};