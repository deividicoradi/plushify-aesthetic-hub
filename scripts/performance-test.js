#!/usr/bin/env node

const { spawn } = require('child_process');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:8080',
  outputDir: './performance-reports',
  testDuration: 300000, // 5 minutes
  concurrent: {
    light: 10,
    moderate: 50,
    heavy: 100
  }
};

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

// Performance Test Runner
class PerformanceTestRunner {
  constructor() {
    this.results = {
      lighthouse: [],
      loadTests: [],
      stressTests: [],
      memoryUsage: [],
      networkStats: []
    };
  }

  // Run Lighthouse audits
  async runLighthouseAudits() {
    console.log('🔍 Running Lighthouse Performance Audits...');
    
    const urls = [
      '/',
      '/about',
      '/product',
      '/plans',
      '/auth'
    ];

    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    for (const url of urls) {
      console.log(`  Testing: ${CONFIG.baseUrl}${url}`);
      
      try {
        const { lhr } = await lighthouse(`${CONFIG.baseUrl}${url}`, {
          port: (new URL(browser.wsEndpoint())).port,
          output: 'json',
          logLevel: 'info',
        });

        const result = {
          url,
          timestamp: new Date().toISOString(),
          scores: {
            performance: lhr.categories.performance.score * 100,
            accessibility: lhr.categories.accessibility.score * 100,
            bestPractices: lhr.categories['best-practices'].score * 100,
            seo: lhr.categories.seo.score * 100,
            pwa: lhr.categories.pwa?.score * 100 || 0
          },
          metrics: {
            firstContentfulPaint: lhr.audits['first-contentful-paint'].numericValue,
            largestContentfulPaint: lhr.audits['largest-contentful-paint'].numericValue,
            cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].numericValue,
            speedIndex: lhr.audits['speed-index'].numericValue,
            timeToInteractive: lhr.audits['interactive'].numericValue,
            totalBlockingTime: lhr.audits['total-blocking-time'].numericValue
          }
        };

        this.results.lighthouse.push(result);
        
        // Save individual report
        const reportPath = path.join(CONFIG.outputDir, `lighthouse-${url.replace(/[\/\\]/g, '_')}-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(lhr, null, 2));
        
      } catch (error) {
        console.error(`  ❌ Error testing ${url}:`, error.message);
      }
    }

    await browser.close();
    console.log('✅ Lighthouse audits completed');
  }

  // Run load tests with Artillery
  async runLoadTests() {
    console.log('⚡ Running Load Tests...');
    
    const testLevels = ['light', 'moderate', 'heavy'];
    
    for (const level of testLevels) {
      console.log(`  Running ${level} load test...`);
      
      const startTime = Date.now();
      const artilleryConfig = this.generateArtilleryConfig(level);
      
      try {
        const result = await this.executeArtillery(artilleryConfig);
        
        this.results.loadTests.push({
          level,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
          ...result
        });
        
        console.log(`  ✅ ${level} load test completed`);
      } catch (error) {
        console.error(`  ❌ ${level} load test failed:`, error.message);
      }
    }
  }

  // Generate Artillery configuration
  generateArtilleryConfig(level) {
    const configs = {
      light: { arrivalRate: 5, duration: 60 },
      moderate: { arrivalRate: 25, duration: 120 },
      heavy: { arrivalRate: 50, duration: 180 }
    };

    return {
      config: {
        target: CONFIG.baseUrl,
        phases: [{
          duration: configs[level].duration,
          arrivalRate: configs[level].arrivalRate
        }]
      },
      scenarios: [{
        name: `${level}_load_test`,
        flow: [
          { get: { url: '/' } },
          { think: 2 },
          { get: { url: '/about' } },
          { think: 1 },
          { get: { url: '/plans' } }
        ]
      }]
    };
  }

  // Execute Artillery test
  async executeArtillery(config) {
    return new Promise((resolve, reject) => {
      const configPath = path.join(CONFIG.outputDir, `artillery-config-${Date.now()}.yml`);
      const outputPath = path.join(CONFIG.outputDir, `artillery-results-${Date.now()}.json`);
      
      // Write temporary config
      const yaml = require('js-yaml');
      fs.writeFileSync(configPath, yaml.dump(config));
      
      const artillery = spawn('npx', ['artillery', 'run', configPath, '--output', outputPath], {
        stdio: 'pipe'
      });
      
      let output = '';
      artillery.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      artillery.on('close', (code) => {
        // Clean up temp files
        fs.unlinkSync(configPath);
        
        if (code === 0 && fs.existsSync(outputPath)) {
          const results = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
          fs.unlinkSync(outputPath);
          resolve(results);
        } else {
          reject(new Error(`Artillery exited with code ${code}`));
        }
      });
      
      artillery.on('error', reject);
    });
  }

  // Monitor system resources
  async monitorResources() {
    console.log('📊 Monitoring System Resources...');
    
    const interval = setInterval(() => {
      const usage = process.memoryUsage();
      this.results.memoryUsage.push({
        timestamp: new Date().toISOString(),
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external
      });
    }, 1000);

    // Stop monitoring after test duration
    setTimeout(() => {
      clearInterval(interval);
      console.log('✅ Resource monitoring completed');
    }, CONFIG.testDuration);
  }

  // Generate comprehensive report
  generateReport() {
    console.log('📋 Generating Performance Report...');
    
    const report = {
      testInfo: {
        timestamp: new Date().toISOString(),
        baseUrl: CONFIG.baseUrl,
        duration: CONFIG.testDuration,
        environment: process.env.NODE_ENV || 'development'
      },
      summary: this.generateSummary(),
      lighthouse: this.results.lighthouse,
      loadTests: this.results.loadTests,
      recommendations: this.generateRecommendations()
    };

    // Save comprehensive report
    const reportPath = path.join(CONFIG.outputDir, `performance-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Generate HTML report
    this.generateHTMLReport(report);
    
    console.log(`✅ Report saved to: ${reportPath}`);
    
    return report;
  }

  // Generate performance summary
  generateSummary() {
    const lighthouseAvg = this.results.lighthouse.reduce((acc, result) => {
      Object.keys(result.scores).forEach(key => {
        acc[key] = (acc[key] || 0) + result.scores[key];
      });
      return acc;
    }, {});

    Object.keys(lighthouseAvg).forEach(key => {
      lighthouseAvg[key] = Math.round(lighthouseAvg[key] / this.results.lighthouse.length);
    });

    return {
      lighthouse: {
        averageScores: lighthouseAvg,
        totalPages: this.results.lighthouse.length
      },
      loadTests: {
        totalTests: this.results.loadTests.length,
        levels: this.results.loadTests.map(test => test.level)
      }
    };
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];
    
    // Analyze Lighthouse results
    const avgPerformance = this.results.lighthouse.reduce((acc, result) => 
      acc + result.scores.performance, 0) / this.results.lighthouse.length;
    
    if (avgPerformance < 80) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Performance score is below 80. Consider optimizing images, CSS, and JavaScript.',
        actions: [
          'Implement lazy loading for images',
          'Minify and compress CSS/JS files',
          'Enable gzip compression',
          'Optimize Critical Rendering Path'
        ]
      });
    }

    return recommendations;
  }

  // Generate HTML report
  generateHTMLReport(report) {
    const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Performance Test Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
            .metric { display: inline-block; margin: 10px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .score { font-size: 24px; font-weight: bold; }
            .good { color: #4CAF50; }
            .warning { color: #FF9800; }
            .error { color: #F44336; }
            .section { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 Performance Test Report</h1>
            <p><strong>Base URL:</strong> ${report.testInfo.baseUrl}</p>
            <p><strong>Test Date:</strong> ${new Date(report.testInfo.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="section">
            <h2>📊 Lighthouse Scores</h2>
            ${Object.entries(report.summary.lighthouse.averageScores).map(([key, value]) => `
                <div class="metric">
                    <div class="score ${value >= 80 ? 'good' : value >= 60 ? 'warning' : 'error'}">${value}</div>
                    <div>${key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>🔥 Load Test Results</h2>
            <p>Completed ${report.loadTests.length} load tests across different traffic levels.</p>
        </div>
        
        <div class="section">
            <h2>💡 Recommendations</h2>
            ${report.recommendations.map(rec => `
                <div class="metric">
                    <strong>${rec.type.toUpperCase()}</strong><br>
                    ${rec.message}<br>
                    <small>Priority: ${rec.priority}</small>
                </div>
            `).join('')}
        </div>
    </body>
    </html>`;
    
    const htmlPath = path.join(CONFIG.outputDir, `performance-report-${Date.now()}.html`);
    fs.writeFileSync(htmlPath, html);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Performance Testing...\n');
    
    const startTime = Date.now();
    
    // Start resource monitoring
    this.monitorResources();
    
    // Run tests in sequence
    await this.runLighthouseAudits();
    await this.runLoadTests();
    
    // Generate final report
    const report = this.generateReport();
    
    const totalTime = Date.now() - startTime;
    console.log(`\n✅ All tests completed in ${Math.round(totalTime / 1000)}s`);
    console.log(`📊 View reports in: ${CONFIG.outputDir}`);
    
    return report;
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new PerformanceTestRunner();
  runner.runAllTests().catch(console.error);
}

module.exports = PerformanceTestRunner;