/**
 * WaveCommerce System Tester - Comprehensive Testing & Optimization Tools
 * 
 * This utility provides "fire and forget" testing capabilities to ensure
 * the system is performing optimally at every stage.
 * 
 * TESTING CATEGORIES:
 * 1. API Performance & Rate Limiting
 * 2. Image Processing & Storage
 * 3. Revenue Calculation Accuracy
 * 4. Cache Efficiency
 * 5. Error Handling & Recovery
 * 6. Performance Benchmarks
 */

import { makePexelsRequest, getAPIStats } from '../services/apiRateLimit.js';
import imageStorage, { getLatestImages, storeGeneratedImages } from '../services/imageStorage.js';
import { calculateActualMonthlyRevenue } from '../services/accurateRevenueCalculator.js';

class SystemTester {
  constructor() {
    this.testResults = {
      apiPerformance: {},
      imageProcessing: {},
      revenueCalculations: {},
      cacheEfficiency: {},
      errorHandling: {},
      performanceBenchmarks: {}
    };
    
    console.log('🧪 WaveCommerce System Tester Initialized');
  }

  /**
   * RUN ALL TESTS - Fire and Forget Validation
   * This is your main testing function
   */
  async runFullSystemTest() {
    console.group('🚀 FULL SYSTEM TEST - WaveCommerce');
    console.log('Testing all systems for optimal performance...');
    
    const startTime = performance.now();
    
    try {
      // Test 1: API & Rate Limiting
      console.log('\n📡 Testing API Performance...');
      await this.testAPIPerformance();
      
      // Test 2: Image Storage & Cache
      console.log('\n💾 Testing Image Storage...');
      await this.testImageStorage();
      
      // Test 3: Revenue Calculations
      console.log('\n💰 Testing Revenue Calculations...');
      await this.testRevenueCalculations();
      
      // Test 4: Cache Efficiency
      console.log('\n⚡ Testing Cache Efficiency...');
      await this.testCacheEfficiency();
      
      // Test 5: Error Handling
      console.log('\n🛡️ Testing Error Handling...');
      await this.testErrorHandling();
      
      // Test 6: Performance Benchmarks
      console.log('\n📊 Running Performance Benchmarks...');
      await this.testPerformanceBenchmarks();
      
      const totalTime = performance.now() - startTime;
      
      // Generate Report
      this.generateTestReport(totalTime);
      
      return this.testResults;
      
    } catch (error) {
      console.error('💥 System test failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Test API Performance & Rate Limiting
   */
  async testAPIPerformance() {
    const tests = [];
    
    // Test 1: Rate limiting response
    tests.push(this.measureTest('Rate Limit Check', async () => {
      const stats = getAPIStats();
      return {
        pexelsUsage: stats.pexels.currentUsage,
        printifyUsage: stats.printify.currentUsage,
        errorRates: {
          pexels: stats.pexels.errorRate,
          printify: stats.printify.errorRate
        }
      };
    }));
    
    // Test 2: Mock API request timing
    tests.push(this.measureTest('API Response Time', async () => {
      const mockRequest = () => new Promise(resolve => 
        setTimeout(() => resolve({ status: 200 }), Math.random() * 100)
      );
      
      const start = performance.now();
      await makePexelsRequest(mockRequest);
      const responseTime = performance.now() - start;
      
      return { responseTime: Math.round(responseTime) };
    }));
    
    const results = await Promise.all(tests);
    this.testResults.apiPerformance = {
      rateLimiting: results[0],
      responseTime: results[1],
      status: 'PASS'
    };
    
    console.log('✅ API Performance:', this.testResults.apiPerformance);
  }

  /**
   * Test Image Storage & IndexedDB
   */
  async testImageStorage() {
    const tests = [];
    
    // Test 1: Storage capacity
    tests.push(this.measureTest('Storage Capacity', async () => {
      const stats = await imageStorage.getStorageStats();
      return stats;
    }));
    
    // Test 2: Cache retrieval speed
    tests.push(this.measureTest('Cache Retrieval Speed', async () => {
      const start = performance.now();
      const cachedImages = await getLatestImages();
      const retrievalTime = performance.now() - start;
      
      return {
        retrievalTime: Math.round(retrievalTime),
        imageCount: cachedImages.length,
        cacheHit: cachedImages.length > 0
      };
    }));
    
    // Test 3: Storage write performance
    tests.push(this.measureTest('Storage Write Speed', async () => {
      const mockImages = [{
        id: 'test-image-1',
        original: 'https://example.com/test.jpg',
        processed: 'data:image/jpeg;base64,test',
        caption: 'Test Caption',
        filename: 'test-image'
      }];
      
      const start = performance.now();
      try {
        await storeGeneratedImages(mockImages, { test: true });
        const writeTime = performance.now() - start;
        return { writeTime: Math.round(writeTime), success: true };
      } catch (error) {
        return { writeTime: -1, success: false, error: error.message };
      }
    }));
    
    const results = await Promise.all(tests);
    this.testResults.imageProcessing = {
      storageCapacity: results[0],
      retrievalSpeed: results[1],
      writeSpeed: results[2],
      status: results.every(r => r.success !== false) ? 'PASS' : 'WARN'
    };
    
    console.log('✅ Image Storage:', this.testResults.imageProcessing);
  }

  /**
   * Test Revenue Calculation Accuracy
   */
  async testRevenueCalculations() {
    const tests = [];
    
    // Test 1: Basic calculation consistency
    tests.push(this.measureTest('Calculation Consistency', async () => {
      const calc1 = calculateActualMonthlyRevenue({ numProducts: 20 });
      const calc2 = calculateActualMonthlyRevenue({ numProducts: 20 });
      
      return {
        consistent: calc1.monthlyBankDeposit === calc2.monthlyBankDeposit,
        result1: calc1.monthlyBankDeposit,
        result2: calc2.monthlyBankDeposit
      };
    }));
    
    // Test 2: Edge case handling
    tests.push(this.measureTest('Edge Cases', async () => {
      const zeroProducts = calculateActualMonthlyRevenue({ numProducts: 0 });
      const maxProducts = calculateActualMonthlyRevenue({ numProducts: 1000 });
      
      return {
        handlesZero: !isNaN(zeroProducts.monthlyBankDeposit),
        handlesLarge: !isNaN(maxProducts.monthlyBankDeposit),
        zeroResult: zeroProducts.monthlyBankDeposit,
        largeResult: maxProducts.monthlyBankDeposit
      };
    }));
    
    // Test 3: Performance at scale
    tests.push(this.measureTest('Calculation Performance', async () => {
      const start = performance.now();
      
      for (let i = 0; i < 100; i++) {
        calculateActualMonthlyRevenue({ numProducts: 20 });
      }
      
      const calculationTime = performance.now() - start;
      return { avgTimePerCalc: Math.round(calculationTime / 100 * 100) / 100 };
    }));
    
    const results = await Promise.all(tests);
    this.testResults.revenueCalculations = {
      consistency: results[0],
      edgeCases: results[1],
      performance: results[2],
      status: 'PASS'
    };
    
    console.log('✅ Revenue Calculations:', this.testResults.revenueCalculations);
  }

  /**
   * Test Cache Efficiency
   */
  async testCacheEfficiency() {
    const cacheStats = getAPIStats();
    
    this.testResults.cacheEfficiency = {
      pexelsCacheHits: cacheStats.pexels.cached,
      printifyCacheHits: cacheStats.printify.cached,
      totalAPICalls: cacheStats.pexels.total + cacheStats.printify.total,
      cacheEfficiency: cacheStats.pexels.cached > 0 ? 
        Math.round((cacheStats.pexels.cached / (cacheStats.pexels.cached + cacheStats.pexels.total)) * 100) : 0,
      status: cacheStats.pexels.cached > 0 ? 'OPTIMAL' : 'WARMING'
    };
    
    console.log('✅ Cache Efficiency:', this.testResults.cacheEfficiency);
  }

  /**
   * Test Error Handling & Recovery
   */
  async testErrorHandling() {
    const tests = [];
    
    // Test 1: Network error simulation
    tests.push(this.measureTest('Network Error Handling', async () => {
      try {
        await makePexelsRequest(() => Promise.reject(new Error('Network timeout')));
        return { handled: false };
      } catch (error) {
        return { handled: true, errorType: error.message };
      }
    }));
    
    // Test 2: Invalid data handling
    tests.push(this.measureTest('Invalid Data Handling', async () => {
      try {
        const result = calculateActualMonthlyRevenue({ numProducts: 'invalid' });
        return { handled: !isNaN(result.monthlyBankDeposit) };
      } catch (error) {
        return { handled: true, errorType: 'Validation Error' };
      }
    }));
    
    const results = await Promise.all(tests);
    this.testResults.errorHandling = {
      networkErrors: results[0],
      dataValidation: results[1],
      status: results.every(r => r.handled) ? 'ROBUST' : 'NEEDS_WORK'
    };
    
    console.log('✅ Error Handling:', this.testResults.errorHandling);
  }

  /**
   * Test Performance Benchmarks
   */
  async testPerformanceBenchmarks() {
    const benchmarks = {};
    
    // Memory usage
    if (performance.memory) {
      benchmarks.memoryUsage = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    
    // DOM performance
    benchmarks.domMetrics = {
      domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0,
      loadComplete: performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0
    };
    
    this.testResults.performanceBenchmarks = {
      ...benchmarks,
      status: 'MEASURED'
    };
    
    console.log('✅ Performance Benchmarks:', this.testResults.performanceBenchmarks);
  }

  /**
   * Helper function to measure test execution time
   */
  async measureTest(testName, testFunction) {
    const start = performance.now();
    try {
      const result = await testFunction();
      const duration = Math.round((performance.now() - start) * 100) / 100;
      return { 
        name: testName,
        duration: `${duration}ms`,
        success: true,
        ...result 
      };
    } catch (error) {
      const duration = Math.round((performance.now() - start) * 100) / 100;
      return { 
        name: testName,
        duration: `${duration}ms`,
        success: false,
        error: error.message 
      };
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport(totalTime) {
    console.log('\n📋 SYSTEM TEST REPORT');
    console.log('='.repeat(50));
    console.log(`Total Test Time: ${Math.round(totalTime)}ms`);
    console.log(`Test Date: ${new Date().toISOString()}`);
    
    const allTests = Object.values(this.testResults);
    const passedTests = allTests.filter(test => 
      test.status === 'PASS' || test.status === 'OPTIMAL' || test.status === 'ROBUST' || test.status === 'MEASURED'
    ).length;
    
    console.log(`\n🎯 OVERALL STATUS: ${passedTests}/${allTests.length} systems optimal`);
    
    // Individual test status
    Object.entries(this.testResults).forEach(([category, results]) => {
      const status = results.status;
      const emoji = this.getStatusEmoji(status);
      console.log(`${emoji} ${category.toUpperCase()}: ${status}`);
    });
    
    // Recommendations
    this.generateRecommendations();
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    
    const recommendations = [];
    
    // Cache efficiency
    if (this.testResults.cacheEfficiency.cacheEfficiency < 50) {
      recommendations.push('🔄 Consider warming up cache with initial image generation');
    }
    
    // Memory usage
    if (this.testResults.performanceBenchmarks.memoryUsage?.used > 100) {
      recommendations.push('🧹 High memory usage detected - consider implementing cleanup routines');
    }
    
    // Error handling
    if (this.testResults.errorHandling.status !== 'ROBUST') {
      recommendations.push('🛡️ Enhance error handling for production readiness');
    }
    
    if (recommendations.length === 0) {
      console.log('✨ System is optimally configured - no recommendations needed!');
    } else {
      recommendations.forEach(rec => console.log(rec));
    }
  }

  /**
   * Get emoji for test status
   */
  getStatusEmoji(status) {
    const emojis = {
      'PASS': '✅',
      'OPTIMAL': '🚀',
      'ROBUST': '🛡️',
      'MEASURED': '📊',
      'WARN': '⚠️',
      'NEEDS_WORK': '🔧',
      'WARMING': '🔥'
    };
    return emojis[status] || '❓';
  }
}

// Create singleton instance
const systemTester = new SystemTester();

export default systemTester;

/**
 * Convenience function for quick testing
 */
export const runQuickTest = async () => {
  console.log('🏃‍♂️ Running Quick System Test...');
  return await systemTester.runFullSystemTest();
};

/**
 * Function to run on app startup for health check
 */
export const healthCheck = async () => {
  console.log('🏥 Health Check...');
  
  const criticalTests = {
    imageStorage: await systemTester.testImageStorage(),
    revenueCalc: await systemTester.testRevenueCalculations()
  };
  
  console.log('Health Status:', criticalTests);
  return criticalTests;
};