// Lighthouse CI Configuration
module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:8080',
        'http://localhost:8080/about',
        'http://localhost:8080/product',
        'http://localhost:8080/plans',
        'http://localhost:8080/auth',
      ],
      
      // Lighthouse settings
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
      },
      
      // Number of runs
      numberOfRuns: 3,
      
      // Output settings
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
    },
    
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Specific metrics
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxLength: 5 }],
        'unused-javascript': ['warn', { maxLength: 5 }],
        'modern-image-formats': ['warn', { maxLength: 0 }],
        'offscreen-images': ['warn', { maxLength: 0 }],
      },
    },
    
    upload: {
      target: 'temporary-public-storage',
    },
    
    server: {
      port: 9001,
      storage: './lighthouse-reports',
    },
  },
};