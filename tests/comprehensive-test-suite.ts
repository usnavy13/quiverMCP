#!/usr/bin/env node

import axios from 'axios';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface TestCase {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  data?: any;
  expectedStatus?: number;
  shouldFail?: boolean;
  category: 'endpoint' | 'config' | 'error' | 'performance' | 'format';
  description: string;
}

interface TestResult {
  testCase: string;
  category: string;
  success: boolean;
  status?: number;
  duration: number;
  error?: string;
  responseSize?: number;
  timestamp: string;
}

class ComprehensiveTestSuite {
  private baseUrl: string;
  private outputDir: string;
  private results: TestResult[] = [];
  private timestamp: string;

  constructor(baseUrl: string, outputDir: string = './test-results') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.outputDir = outputDir;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
      mkdirSync(this.outputDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
    
    console.log(`🧪 Comprehensive Test Suite for: ${this.baseUrl}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`⏰ Timestamp: ${this.timestamp}\n`);
  }

  private getTestCases(): TestCase[] {
    return [
      // Basic health checks
      {
        name: 'health_check',
        method: 'GET',
        path: '/health',
        expectedStatus: 200,
        category: 'endpoint',
        description: 'Server health check'
      },
      {
        name: 'mcp_info',
        method: 'GET', 
        path: '/mcp',
        expectedStatus: 200,
        category: 'endpoint',
        description: 'MCP server information'
      },

      // MCP Protocol Tests
      {
        name: 'mcp_initialize',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: { tools: { listChanged: true }, prompts: { listChanged: true }, resources: { listChanged: true } },
            clientInfo: { name: 'test-suite', version: '1.0.0' }
          }
        },
        expectedStatus: 200,
        category: 'endpoint',
        description: 'MCP initialization'
      },

      // Response Mode Testing
      {
        name: 'response_mode_summary',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 10,
          method: 'tools/call',
          params: {
            name: 'get_recent_congress_trading',
            arguments: { mode: 'summary', limit: 10 }
          }
        },
        category: 'format',
        description: 'Test summary response mode'
      },
      {
        name: 'response_mode_compact',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 11,
          method: 'tools/call',
          params: {
            name: 'get_recent_congress_trading',
            arguments: { mode: 'compact', limit: 10 }
          }
        },
        category: 'format',
        description: 'Test compact response mode'
      },
      {
        name: 'response_mode_detailed',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 12,
          method: 'tools/call',
          params: {
            name: 'get_recent_congress_trading',
            arguments: { mode: 'detailed', limit: 5 }
          }
        },
        category: 'format',
        description: 'Test detailed response mode'
      },

      // Format Testing
      {
        name: 'format_json',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 20,
          method: 'tools/call',
          params: {
            name: 'get_companies',
            arguments: { format: 'json', limit: 5 }
          }
        },
        category: 'format',
        description: 'Test JSON format output'
      },
      {
        name: 'format_table',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 21,
          method: 'tools/call',
          params: {
            name: 'get_companies',
            arguments: { format: 'table', limit: 5 }
          }
        },
        category: 'format',
        description: 'Test table format output'
      },
      {
        name: 'format_csv',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 22,
          method: 'tools/call',
          params: {
            name: 'get_companies',
            arguments: { format: 'csv', limit: 5 }
          }
        },
        category: 'format',
        description: 'Test CSV format output'
      },

      // Field Selection Testing
      {
        name: 'field_selection_basic',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 30,
          method: 'tools/call',
          params: {
            name: 'get_companies',
            arguments: { fields: ['ticker', 'name'], limit: 5 }
          }
        },
        category: 'config',
        description: 'Test basic field selection'
      },
      {
        name: 'field_selection_congress',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 31,
          method: 'tools/call',
          params: {
            name: 'get_recent_congress_trading',
            arguments: { fields: ['ticker', 'representative', 'amount'], limit: 5 }
          }
        },
        category: 'config',
        description: 'Test congress trading field selection'
      },

      // Pagination Testing
      {
        name: 'pagination_basic',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 40,
          method: 'tools/call',
          params: {
            name: 'get_recent_lobbying',
            arguments: { page: 1, page_size: 10 }
          }
        },
        category: 'config',
        description: 'Test basic pagination'
      },
      {
        name: 'pagination_page_2',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 41,
          method: 'tools/call',
          params: {
            name: 'get_recent_lobbying',
            arguments: { page: 2, page_size: 5 }
          }
        },
        category: 'config',
        description: 'Test pagination page 2'
      },

      // Ticker Data Sections Testing
      {
        name: 'ticker_sections_basic',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 50,
          method: 'tools/call',
          params: {
            name: 'get_ticker_data',
            arguments: { ticker: 'AAPL', sections: ['basic'] }
          }
        },
        category: 'config',
        description: 'Test ticker data basic section'
      },
      {
        name: 'ticker_sections_multiple',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 51,
          method: 'tools/call',
          params: {
            name: 'get_ticker_data',
            arguments: { ticker: 'AAPL', sections: ['basic', 'trading'], mode: 'summary' }
          }
        },
        category: 'config',
        description: 'Test ticker data multiple sections'
      },

      // Search and Filter Testing
      {
        name: 'search_companies',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 60,
          method: 'tools/call',
          params: {
            name: 'get_companies',
            arguments: { search: 'Apple', limit: 5 }
          }
        },
        category: 'config',
        description: 'Test company search functionality'
      },
      {
        name: 'bill_summaries_basic',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 62,
          method: 'tools/call',
          params: {
            name: 'get_recent_bill_summaries',
            arguments: { page_size: 5, mode: 'summary' }
          }
        },
        category: 'config',
        description: 'Test recent bill summaries endpoint'
      },
      {
        name: 'bill_summaries_with_query',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 63,
          method: 'tools/call',
          params: {
            name: 'get_recent_bill_summaries',
            arguments: { query: 'defense', summary_limit: 100, page_size: 3 }
          }
        },
        category: 'config',
        description: 'Test bill summaries with query filter'
      },
      {
        name: 'search_funds',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 61,
          method: 'tools/call',
          params: {
            name: 'get_funds',
            arguments: { search: 'Vanguard', limit: 5 }
          }
        },
        category: 'config',
        description: 'Test fund search functionality'
      },

      // Prompts Testing
      {
        name: 'prompts_list',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 70,
          method: 'prompts/list',
          params: {}
        },
        category: 'endpoint',
        description: 'Test prompts list'
      },
      {
        name: 'prompt_congress_analysis',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 71,
          method: 'prompts/get',
          params: {
            name: 'analyze-congress-trading',
            arguments: { ticker: 'AAPL' }
          }
        },
        category: 'endpoint',
        description: 'Test congress analysis prompt'
      },

      // Resources Testing
      {
        name: 'resources_list',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 80,
          method: 'resources/list',
          params: {}
        },
        category: 'endpoint',
        description: 'Test resources list'
      },
      {
        name: 'resource_optimization_guide',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 81,
          method: 'resources/read',
          params: {
            uri: 'quiver://docs/optimization-guide'
          }
        },
        category: 'endpoint',
        description: 'Test optimization guide resource'
      },

      // Error Handling Tests
      {
        name: 'invalid_tool',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 90,
          method: 'tools/call',
          params: {
            name: 'invalid_tool_name',
            arguments: {}
          }
        },
        shouldFail: true,
        category: 'error',
        description: 'Test invalid tool name error handling'
      },
      {
        name: 'missing_ticker',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 91,
          method: 'tools/call',
          params: {
            name: 'get_ticker_data',
            arguments: {} // Missing required ticker
          }
        },
        shouldFail: true,
        category: 'error',
        description: 'Test missing required parameter'
      },
      {
        name: 'invalid_method',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 92,
          method: 'invalid/method',
          params: {}
        },
        shouldFail: true,
        category: 'error',
        description: 'Test invalid MCP method'
      },

      // Missing Tools Testing
      {
        name: 'congress_holdings',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 70,
          method: 'tools/call',
          params: {
            name: 'get_congress_holdings',
            arguments: { limit: 10, mode: 'summary' }
          }
        },
        category: 'endpoint',
        description: 'Test congress holdings endpoint'
      },
      {
        name: 'historical_congress_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 71,
          method: 'tools/call',
          params: {
            name: 'get_historical_congress_trading',
            arguments: { ticker: 'AAPL', limit: 10, mode: 'summary' }
          }
        },
        category: 'endpoint',
        description: 'Test historical congress trading for specific ticker'
      },
      {
        name: 'recent_gov_contracts',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 72,
          method: 'tools/call',
          params: {
            name: 'get_recent_gov_contracts',
            arguments: { limit: 5, mode: 'summary' }
          }
        },
        category: 'endpoint',
        description: 'Test recent government contracts'
      },
      {
        name: 'recent_gov_contracts_all',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 73,
          method: 'tools/call',
          params: {
            name: 'get_recent_gov_contracts_all',
            arguments: { page_size: 5 }
          }
        },
        category: 'endpoint',
        description: 'Test recent government contracts all'
      },
      {
        name: 'recent_house_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 74,
          method: 'tools/call',
          params: {
            name: 'get_recent_house_trading',
            arguments: { limit: 10, mode: 'summary' }
          }
        },
        category: 'endpoint',
        description: 'Test recent House trading'
      },
      {
        name: 'recent_senate_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 75,
          method: 'tools/call',
          params: {
            name: 'get_recent_senate_trading',
            arguments: { limit: 10, mode: 'summary' }
          }
        },
        category: 'endpoint',
        description: 'Test recent Senate trading'
      },
      {
        name: 'recent_legislation',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 76,
          method: 'tools/call',
          params: {
            name: 'get_recent_legislation',
            arguments: {}
          }
        },
        category: 'endpoint',
        description: 'Test recent legislation'
      },
      {
        name: 'live_off_exchange',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 77,
          method: 'tools/call',
          params: {
            name: 'get_live_off_exchange',
            arguments: { page_size: 5 }
          }
        },
        category: 'endpoint',
        description: 'Test live off-exchange data'
      },
      {
        name: 'historical_gov_contracts',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 78,
          method: 'tools/call',
          params: {
            name: 'get_historical_gov_contracts',
            arguments: { ticker: 'LMT' }
          }
        },
        category: 'endpoint',
        description: 'Test historical government contracts for ticker'
      },
      {
        name: 'historical_gov_contracts_all',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 79,
          method: 'tools/call',
          params: {
            name: 'get_historical_gov_contracts_all',
            arguments: { ticker: 'RTX' }
          }
        },
        category: 'endpoint',
        description: 'Test historical government contracts all for ticker'
      },
      {
        name: 'historical_house_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 80,
          method: 'tools/call',
          params: {
            name: 'get_historical_house_trading',
            arguments: { ticker: 'NVDA' }
          }
        },
        category: 'endpoint',
        description: 'Test historical House trading for ticker'
      },
      {
        name: 'historical_senate_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 81,
          method: 'tools/call',
          params: {
            name: 'get_historical_senate_trading',
            arguments: { ticker: 'TSLA' }
          }
        },
        category: 'endpoint',
        description: 'Test historical Senate trading for ticker'
      },
      {
        name: 'historical_lobbying',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 82,
          method: 'tools/call',
          params: {
            name: 'get_historical_lobbying',
            arguments: { ticker: 'GOOGL', page_size: 5 }
          }
        },
        category: 'endpoint',
        description: 'Test historical lobbying for ticker'
      },
      {
        name: 'historical_off_exchange',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 83,
          method: 'tools/call',
          params: {
            name: 'get_historical_off_exchange',
            arguments: { ticker: 'AAPL' }
          }
        },
        category: 'endpoint',
        description: 'Test historical off-exchange data for ticker'
      },

      // Performance Tests
      {
        name: 'large_limit_test',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 100,
          method: 'tools/call',
          params: {
            name: 'get_recent_congress_trading',
            arguments: { limit: 500, mode: 'summary' }
          }
        },
        category: 'performance',
        description: 'Test large limit performance'
      },
      {
        name: 'bulk_data_test',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 101,
          method: 'tools/call',
          params: {
            name: 'get_bulk_congress_trading',
            arguments: { mode: 'summary', limit: 100 }
          }
        },
        category: 'performance',
        description: 'Test bulk data endpoint performance'
      }
    ];
  }

  private async executeTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${testCase.path}`;

    try {
      console.log(`🔄 ${testCase.category.toUpperCase()}: ${testCase.name}`);

      const config = {
        method: testCase.method,
        url,
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
        ...(testCase.data && { data: testCase.data })
      };

      const response = await axios(config);
      const duration = Date.now() - startTime;
      const responseSize = JSON.stringify(response.data).length;

      // Check if this was supposed to fail
      if (testCase.shouldFail) {
        // For JSON-RPC, errors are in response.data.error, not HTTP status
        if (response.data && response.data.error) {
          console.log(`✅ ${testCase.name} - Expected failure caught correctly (JSON-RPC error)`);
          return {
            testCase: testCase.name,
            category: testCase.category,
            success: true,
            status: response.status,
            duration,
            responseSize,
            timestamp: new Date().toISOString()
          };
        } else {
          console.log(`⚠️  ${testCase.name} - Expected failure but got success (${response.status})`);
          return {
            testCase: testCase.name,
            category: testCase.category,
            success: false,
            status: response.status,
            duration,
            responseSize,
            error: 'Expected failure but got success',
            timestamp: new Date().toISOString()
          };
        }
      }

      // Check expected status
      if (testCase.expectedStatus && response.status !== testCase.expectedStatus) {
        console.log(`❌ ${testCase.name} - Wrong status: ${response.status}, expected: ${testCase.expectedStatus}`);
        return {
          testCase: testCase.name,
          category: testCase.category,
          success: false,
          status: response.status,
          duration,
          responseSize,
          error: `Wrong status: ${response.status}, expected: ${testCase.expectedStatus}`,
          timestamp: new Date().toISOString()
        };
      }

      console.log(`✅ ${testCase.name} (${response.status}) - ${duration}ms - ${responseSize} bytes`);

      // Save individual response if enabled
      if (process.env.SAVE_RESPONSES === 'true') {
        this.saveIndividualResponse(testCase.name, response.data);
      }

      return {
        testCase: testCase.name,
        category: testCase.category,
        success: true,
        status: response.status,
        duration,
        responseSize,
        responseData: process.env.INCLUDE_RESPONSE_DATA === 'true' ? response.data : undefined,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const duration = Date.now() - startTime;

      // If we expected this to fail, it's actually a success
      if (testCase.shouldFail) {
        console.log(`✅ ${testCase.name} - Expected failure caught correctly`);
        return {
          testCase: testCase.name,
          category: testCase.category,
          success: true,
          duration,
          error: 'Expected failure',
          timestamp: new Date().toISOString()
        };
      }

      if (axios.isAxiosError(error)) {
        console.log(`❌ ${testCase.name} (${error.response?.status || 'ERROR'}) - ${duration}ms`);
        return {
          testCase: testCase.name,
          category: testCase.category,
          success: false,
          status: error.response?.status,
          duration,
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }

      console.log(`❌ ${testCase.name} (NETWORK ERROR) - ${duration}ms`);
      return {
        testCase: testCase.name,
        category: testCase.category,
        success: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  private saveIndividualResponse(testName: string, responseData: any): void {
    const filename = `${testName}_response_${this.timestamp}.json`;
    const filepath = join(this.outputDir, filename);
    
    try {
      writeFileSync(filepath, JSON.stringify(responseData, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save response for ${testName}:`, error);
    }
  }

  private generateReport(): void {
    const categories = [...new Set(this.results.map(r => r.category))];
    const reportFile = join(this.outputDir, `test-report_${this.timestamp}.json`);
    
    const report = {
      timestamp: this.timestamp,
      baseUrl: this.baseUrl,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        success_rate: ((this.results.filter(r => r.success).length / this.results.length) * 100).toFixed(1)
      },
      performance: {
        avg_duration: Math.round(this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length),
        max_duration: Math.max(...this.results.map(r => r.duration)),
        min_duration: Math.min(...this.results.map(r => r.duration)),
        avg_response_size: Math.round(this.results.filter(r => r.responseSize).reduce((sum, r) => sum + (r.responseSize || 0), 0) / this.results.filter(r => r.responseSize).length)
      },
      categories: categories.map(category => {
        const categoryResults = this.results.filter(r => r.category === category);
        return {
          name: category,
          total: categoryResults.length,
          passed: categoryResults.filter(r => r.success).length,
          failed: categoryResults.filter(r => !r.success).length,
          success_rate: ((categoryResults.filter(r => r.success).length / categoryResults.length) * 100).toFixed(1)
        };
      }),
      results: this.results
    };

    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📊 Test report saved to: ${reportFile}`);
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.length - passed;
    const categories = [...new Set(this.results.map(r => r.category))];

    console.log('\n' + '='.repeat(80));
    console.log('🧪 COMPREHENSIVE TEST SUITE RESULTS');
    console.log('='.repeat(80));
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`📈 Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);

    console.log('\n📋 RESULTS BY CATEGORY:');
    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      const categoryPassed = categoryResults.filter(r => r.success).length;
      const categoryFailed = categoryResults.length - categoryPassed;
      const successRate = ((categoryPassed / categoryResults.length) * 100).toFixed(1);
      
      console.log(`   ${category.toUpperCase()}: ${categoryPassed}/${categoryResults.length} (${successRate}%)`);
    });

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`   ${r.testCase} (${r.category}): ${r.error || `HTTP ${r.status}`}`);
      });
    }

    const avgDuration = Math.round(this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length);
    const maxDuration = Math.max(...this.results.map(r => r.duration));
    console.log(`\n⏱️  Performance: Avg ${avgDuration}ms, Max ${maxDuration}ms`);
    console.log(`📁 Full results saved to: ${this.outputDir}`);
    console.log('='.repeat(80));
  }

  public async runAllTests(): Promise<void> {
    const testCases = this.getTestCases();
    console.log(`🎯 Running ${testCases.length} comprehensive tests...\n`);

    for (const testCase of testCases) {
      const result = await this.executeTest(testCase);
      this.results.push(result);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.generateReport();
    this.printSummary();
  }
}

// CLI interface
function printUsage(): void {
  console.log(`
Usage: npm run test:comprehensive <base_url>

Examples:
  npm run test:comprehensive http://localhost:3000
  tsx tests/comprehensive-test-suite.ts http://localhost:3000

Features:
  - Tests all endpoints and configurations
  - Response mode testing (summary, compact, detailed)
  - Format testing (json, table, csv)
  - Error handling validation
  - Performance measurement
  - Comprehensive reporting

Output:
  - Individual test results
  - Performance metrics
  - Category-based analysis
  - Detailed JSON report
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    printUsage();
    process.exit(1);
  }

  const baseUrl = args[0];
  
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    console.error('❌ Base URL must start with http:// or https://');
    process.exit(1);
  }

  const testSuite = new ComprehensiveTestSuite(baseUrl);
  
  try {
    await testSuite.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Test suite interrupted by user');
  process.exit(1);
});

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}