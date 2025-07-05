#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Stress Test Configuration
const STRESS_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:8080',
  outputDir: './stress-test-reports',
  concurrent: {
    browsers: 10,
    pages: 20,
    requests: 100
  },
  scenarios: [
    'memory_leak_detection',
    'concurrent_users',
    'rapid_navigation',
    'form_submission_stress',
    'api_endpoint_stress'
  ]
};

// Ensure output directory exists
if (!fs.existsSync(STRESS_CONFIG.outputDir)) {
  fs.mkdirSync(STRESS_CONFIG.outputDir, { recursive: true });
}

class StressTestRunner {
  constructor() {
    this.results = {
      memoryLeaks: [],
      concurrentUsers: [],
      navigationStress: [],
      formStress: [],
      apiStress: [],
      systemMetrics: []
    };
  }

  // Test 1: Memory Leak Detection
  async testMemoryLeaks() {
    console.log('🧠 Testing for Memory Leaks...');
    
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Enable performance monitoring
    await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = [];
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        window.performanceMetrics.push({
          type: 'navigation',
          timestamp: Date.now(),
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null
        });
        return originalPushState.apply(this, args);
      };
      
      history.replaceState = function(...args) {
        window.performanceMetrics.push({
          type: 'navigation',
          timestamp: Date.now(),
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null
        });
        return originalReplaceState.apply(this, args);
      };
    });

    const routes = [
      '/',
      '/about',
      '/product',
      '/plans',
      '/auth',
      '/dashboard',
      '/appointments',
      '/clients',
      '/financial'
    ];

    const memorySnapshots = [];
    
    // Navigate through routes multiple times
    for (let cycle = 0; cycle < 5; cycle++) {
      console.log(`  Cycle ${cycle + 1}/5`);
      
      for (const route of routes) {
        await page.goto(`${STRESS_CONFIG.baseUrl}${route}`, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        // Take memory snapshot
        const metrics = await page.metrics();
        const jsHeap = await page.evaluate(() => {
          return performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null;
        });
        
        memorySnapshots.push({
          cycle,
          route,
          timestamp: Date.now(),
          metrics,
          jsHeap
        });
        
        // Wait a bit between navigations
        await page.waitForTimeout(1000);
      }
    }
    
    // Analyze memory usage trends
    const memoryAnalysis = this.analyzeMemoryUsage(memorySnapshots);
    this.results.memoryLeaks.push(memoryAnalysis);
    
    await browser.close();
    console.log('✅ Memory leak test completed');
    
    return memoryAnalysis;
  }

  // Test 2: Concurrent Users Simulation
  async testConcurrentUsers() {
    console.log('👥 Testing Concurrent Users...');
    
    const userCount = 10;
    const browsers = [];
    const results = [];
    
    // Launch multiple browsers
    for (let i = 0; i < userCount; i++) {
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage']
      });
      browsers.push(browser);
    }
    
    // Run concurrent user sessions
    const promises = browsers.map(async (browser, index) => {
      const page = await browser.newPage();
      const userSession = {
        userId: index,
        startTime: Date.now(),
        actions: [],
        errors: []
      };
      
      try {
        // Simulate typical user journey
        const actions = [
          { action: 'visit_homepage', url: '/' },
          { action: 'view_about', url: '/about' },
          { action: 'check_plans', url: '/plans' },
          { action: 'go_to_auth', url: '/auth' }
        ];
        
        for (const { action, url } of actions) {
          const startTime = Date.now();
          
          try {
            await page.goto(`${STRESS_CONFIG.baseUrl}${url}`, { 
              waitUntil: 'networkidle0',
              timeout: 15000 
            });
            
            userSession.actions.push({
              action,
              url,
              duration: Date.now() - startTime,
              success: true
            });
            
            // Random wait time between actions
            await page.waitForTimeout(Math.random() * 3000 + 1000);
            
          } catch (error) {
            userSession.errors.push({
              action,
              url,
              error: error.message,
              timestamp: Date.now()
            });
          }
        }
        
      } catch (error) {
        userSession.errors.push({
          action: 'session_error',
          error: error.message,
          timestamp: Date.now()
        });
      }
      
      userSession.endTime = Date.now();
      userSession.totalDuration = userSession.endTime - userSession.startTime;
      
      return userSession;
    });
    
    const userSessions = await Promise.all(promises);
    
    // Close all browsers
    await Promise.all(browsers.map(browser => browser.close()));
    
    // Analyze concurrent user results
    const concurrentAnalysis = {
      totalUsers: userCount,
      successfulSessions: userSessions.filter(s => s.errors.length === 0).length,
      averageDuration: userSessions.reduce((acc, s) => acc + s.totalDuration, 0) / userSessions.length,
      totalErrors: userSessions.reduce((acc, s) => acc + s.errors.length, 0),
      userSessions
    };
    
    this.results.concurrentUsers.push(concurrentAnalysis);
    
    console.log(`✅ Concurrent users test completed: ${concurrentAnalysis.successfulSessions}/${userCount} successful sessions`);
    
    return concurrentAnalysis;
  }

  // Test 3: Rapid Navigation Stress
  async testRapidNavigation() {
    console.log('🏃 Testing Rapid Navigation...');
    
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    const routes = [
      '/',
      '/about',
      '/product',
      '/plans',
      '/auth'
    ];
    
    const navigationResults = [];
    const navigationCount = 50;
    
    for (let i = 0; i < navigationCount; i++) {
      const route = routes[Math.floor(Math.random() * routes.length)];
      const startTime = Date.now();
      
      try {
        await page.goto(`${STRESS_CONFIG.baseUrl}${route}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        navigationResults.push({
          iteration: i,
          route,
          duration: Date.now() - startTime,
          success: true,
          timestamp: Date.now()
        });
        
        // Very short wait between navigations
        await page.waitForTimeout(100);
        
      } catch (error) {
        navigationResults.push({
          iteration: i,
          route,
          duration: Date.now() - startTime,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
    
    await browser.close();
    
    const rapidNavAnalysis = {
      totalNavigations: navigationCount,
      successfulNavigations: navigationResults.filter(r => r.success).length,
      averageLoadTime: navigationResults
        .filter(r => r.success)
        .reduce((acc, r) => acc + r.duration, 0) / navigationResults.filter(r => r.success).length,
      results: navigationResults
    };
    
    this.results.navigationStress.push(rapidNavAnalysis);
    
    console.log(`✅ Rapid navigation test completed: ${rapidNavAnalysis.successfulNavigations}/${navigationCount} successful`);
    
    return rapidNavAnalysis;
  }

  // Analyze memory usage patterns
  analyzeMemoryUsage(snapshots) {
    const memoryTrend = {};
    
    snapshots.forEach(snapshot => {
      if (!memoryTrend[snapshot.route]) {
        memoryTrend[snapshot.route] = [];
      }
      
      memoryTrend[snapshot.route].push({
        cycle: snapshot.cycle,
        usedMemory: snapshot.jsHeap?.usedJSHeapSize || 0,
        totalMemory: snapshot.jsHeap?.totalJSHeapSize || 0
      });
    });
    
    // Detect potential memory leaks
    const leakDetection = {};
    Object.keys(memoryTrend).forEach(route => {
      const memories = memoryTrend[route];
      const firstCycle = memories[0]?.usedMemory || 0;
      const lastCycle = memories[memories.length - 1]?.usedMemory || 0;
      const growthPercentage = ((lastCycle - firstCycle) / firstCycle) * 100;
      
      leakDetection[route] = {
        initialMemory: firstCycle,
        finalMemory: lastCycle,
        growthPercentage: isNaN(growthPercentage) ? 0 : growthPercentage,
        potentialLeak: growthPercentage > 50 // More than 50% growth might indicate a leak
      };
    });
    
    return {
      snapshots,
      trends: memoryTrend,
      leakDetection
    };
  }

  // Generate stress test report
  generateStressReport() {
    console.log('📋 Generating Stress Test Report...');
    
    const report = {
      testInfo: {
        timestamp: new Date().toISOString(),
        baseUrl: STRESS_CONFIG.baseUrl,
        scenarios: STRESS_CONFIG.scenarios
      },
      results: this.results,
      summary: {
        memoryLeaks: this.results.memoryLeaks.length > 0 ? 
          Object.values(this.results.memoryLeaks[0].leakDetection).some(r => r.potentialLeak) : false,
        concurrentUserSuccess: this.results.concurrentUsers.length > 0 ?
          this.results.concurrentUsers[0].successfulSessions / this.results.concurrentUsers[0].totalUsers : 0,
        navigationStress: this.results.navigationStress.length > 0 ?
          this.results.navigationStress[0].successfulNavigations / this.results.navigationStress[0].totalNavigations : 0
      },
      recommendations: this.generateStressRecommendations()
    };
    
    // Save report
    const reportPath = path.join(STRESS_CONFIG.outputDir, `stress-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Stress test report saved to: ${reportPath}`);
    
    return report;
  }

  // Generate stress test recommendations
  generateStressRecommendations() {
    const recommendations = [];
    
    // Memory leak recommendations
    if (this.results.memoryLeaks.length > 0) {
      const hasLeaks = Object.values(this.results.memoryLeaks[0].leakDetection).some(r => r.potentialLeak);
      if (hasLeaks) {
        recommendations.push({
          type: 'memory',
          priority: 'high',
          message: 'Potential memory leaks detected',
          actions: [
            'Check for event listener cleanup',
            'Verify React component unmounting',
            'Review timer and interval cleanup',
            'Check for circular references'
          ]
        });
      }
    }
    
    // Concurrent user recommendations
    if (this.results.concurrentUsers.length > 0) {
      const successRate = this.results.concurrentUsers[0].successfulSessions / this.results.concurrentUsers[0].totalUsers;
      if (successRate < 0.9) {
        recommendations.push({
          type: 'concurrency',
          priority: 'medium',
          message: `Concurrent user success rate is ${Math.round(successRate * 100)}%`,
          actions: [
            'Optimize server response times',
            'Implement proper error boundaries',
            'Add loading states and fallbacks',
            'Consider implementing rate limiting'
          ]
        });
      }
    }
    
    return recommendations;
  }

  // Run all stress tests
  async runAllStressTests() {
    console.log('🔥 Starting Comprehensive Stress Testing...\n');
    
    const startTime = Date.now();
    
    try {
      await this.testMemoryLeaks();
      await this.testConcurrentUsers();
      await this.testRapidNavigation();
      
      const report = this.generateStressReport();
      
      const totalTime = Date.now() - startTime;
      console.log(`\n✅ All stress tests completed in ${Math.round(totalTime / 1000)}s`);
      console.log(`📊 View reports in: ${STRESS_CONFIG.outputDir}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Stress testing failed:', error);
      throw error;
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new StressTestRunner();
  runner.runAllStressTests().catch(console.error);
}

module.exports = StressTestRunner;