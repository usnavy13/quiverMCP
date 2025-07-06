#!/usr/bin/env node

import axios from 'axios';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface EndpointTest {
  name: string;
  method: 'GET' | 'POST';
  path: string;
  data?: any;
}

interface TestResult {
  endpoint: string;
  method: string;
  url: string;
  success: boolean;
  status?: number;
  headers?: any;
  data?: any;
  error?: string;
  duration: number;
  timestamp: string;
}

class EndpointTester {
  private baseUrl: string;
  private outputDir: string;
  private results: TestResult[] = [];
  private timestamp: string;

  constructor(baseUrl: string, outputDir: string = './endpoint-outputs') {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.outputDir = outputDir;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Create output directory
    try {
      mkdirSync(this.outputDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
    
    console.log(`🚀 Testing endpoints for: ${this.baseUrl}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`⏰ Timestamp: ${this.timestamp}\n`);
  }

  private async makeRequest(endpoint: EndpointTest): Promise<TestResult> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint.path}`;
    const timestamp = new Date().toISOString();

    try {
      console.log(`🔄 Testing ${endpoint.method} ${endpoint.path}`);
      
      const config = {
        method: endpoint.method,
        url,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        },
        ...(endpoint.data && { data: endpoint.data })
      };

      const response = await axios(config);
      const duration = Date.now() - startTime;

      console.log(`✅ ${endpoint.name} (${response.status}) - ${duration}ms`);

      return {
        endpoint: endpoint.name,
        method: endpoint.method,
        url,
        success: true,
        status: response.status,
        headers: response.headers,
        data: response.data,
        duration,
        timestamp
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (axios.isAxiosError(error)) {
        console.log(`❌ ${endpoint.name} (${error.response?.status || 'ERROR'}) - ${duration}ms`);
        
        return {
          endpoint: endpoint.name,
          method: endpoint.method,
          url,
          success: false,
          status: error.response?.status,
          headers: error.response?.headers,
          data: error.response?.data,
          error: error.message,
          duration,
          timestamp
        };
      } else {
        console.log(`❌ ${endpoint.name} (NETWORK ERROR) - ${duration}ms`);
        
        return {
          endpoint: endpoint.name,
          method: endpoint.method,
          url,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration,
          timestamp
        };
      }
    }
  }

  private getEndpointsToTest(): EndpointTest[] {
    return [
      // Basic endpoints
      {
        name: 'health_check',
        method: 'GET',
        path: '/health'
      },
      {
        name: 'mcp_info',
        method: 'GET',
        path: '/mcp'
      },

      // MCP Protocol endpoints
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
            capabilities: {
              tools: { listChanged: true },
              prompts: { listChanged: true },
              resources: { listChanged: true }
            },
            clientInfo: { name: 'endpoint-tester', version: '1.0.0' }
          }
        }
      },
      {
        name: 'mcp_tools_list',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/list',
          params: {}
        }
      },
      {
        name: 'mcp_prompts_list',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 3,
          method: 'prompts/list',
          params: {}
        }
      },
      {
        name: 'mcp_resources_list',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 4,
          method: 'resources/list',
          params: {}
        }
      },

      // Tool calls - Basic data
      {
        name: 'tool_get_companies',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 10,
          method: 'tools/call',
          params: {
            name: 'get_companies',
            arguments: { limit: 5 }
          }
        }
      },
      {
        name: 'tool_get_funds',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 11,
          method: 'tools/call',
          params: {
            name: 'get_funds',
            arguments: { limit: 5 }
          }
        }
      },
      {
        name: 'tool_get_recent_congress_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 12,
          method: 'tools/call',
          params: {
            name: 'get_recent_congress_trading',
            arguments: { limit: 10 }
          }
        }
      },
      {
        name: 'tool_get_congress_holdings',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 13,
          method: 'tools/call',
          params: {
            name: 'get_congress_holdings',
            arguments: { limit: 10 }
          }
        }
      },
      {
        name: 'tool_get_recent_gov_contracts',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 14,
          method: 'tools/call',
          params: {
            name: 'get_recent_gov_contracts',
            arguments: { limit: 5 }
          }
        }
      },
      {
        name: 'tool_get_recent_lobbying',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 15,
          method: 'tools/call',
          params: {
            name: 'get_recent_lobbying',
            arguments: { limit: 5 }
          }
        }
      },

      // Ticker-specific tools (using AAPL as example)
      {
        name: 'tool_get_historical_congress_trading_aapl',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 20,
          method: 'tools/call',
          params: {
            name: 'get_historical_congress_trading',
            arguments: { ticker: 'AAPL', limit: 5 }
          }
        }
      },
      {
        name: 'tool_get_ticker_data_aapl',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 21,
          method: 'tools/call',
          params: {
            name: 'get_ticker_data',
            arguments: { ticker: 'AAPL', sections: ['basic'] }
          }
        }
      },
      {
        name: 'tool_get_historical_gov_contracts_aapl',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 22,
          method: 'tools/call',
          params: {
            name: 'get_historical_gov_contracts',
            arguments: { ticker: 'AAPL' }
          }
        }
      },
      {
        name: 'tool_get_historical_lobbying_aapl',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 23,
          method: 'tools/call',
          params: {
            name: 'get_historical_lobbying',
            arguments: { ticker: 'AAPL', page_size: 3 }
          }
        }
      },

      // More specific tools
      {
        name: 'tool_get_recent_house_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 30,
          method: 'tools/call',
          params: {
            name: 'get_recent_house_trading',
            arguments: { limit: 5 }
          }
        }
      },
      {
        name: 'tool_get_recent_senate_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 31,
          method: 'tools/call',
          params: {
            name: 'get_recent_senate_trading',
            arguments: { limit: 5 }
          }
        }
      },
      {
        name: 'tool_get_recent_gov_contracts_all',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 32,
          method: 'tools/call',
          params: {
            name: 'get_recent_gov_contracts_all',
            arguments: { page_size: 3 }
          }
        }
      },
      {
        name: 'tool_get_recent_legislation',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 33,
          method: 'tools/call',
          params: {
            name: 'get_recent_legislation',
            arguments: {}
          }
        }
      },
      {
        name: 'tool_get_live_off_exchange',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 34,
          method: 'tools/call',
          params: {
            name: 'get_live_off_exchange',
            arguments: { page_size: 3 }
          }
        }
      },

      // Prompt tests
      {
        name: 'prompt_analyze_congress_trading',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 40,
          method: 'prompts/get',
          params: {
            name: 'analyze-congress-trading',
            arguments: { ticker: 'AAPL' }
          }
        }
      },
      {
        name: 'prompt_company_deep_dive',
        method: 'POST',
        path: '/message',
        data: {
          jsonrpc: '2.0',
          id: 41,
          method: 'prompts/get',
          params: {
            name: 'company-deep-dive',
            arguments: { ticker: 'AAPL' }
          }
        }
      }
    ];
  }

  private saveResult(result: TestResult): void {
    const filename = `${result.endpoint}_${this.timestamp}.json`;
    const filepath = join(this.outputDir, filename);
    
    try {
      writeFileSync(filepath, JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(`❌ Failed to save ${filename}:`, error);
    }
  }

  private saveSummary(): void {
    const summaryFile = join(this.outputDir, `summary_${this.timestamp}.json`);
    const summary = {
      timestamp: this.timestamp,
      baseUrl: this.baseUrl,
      totalTests: this.results.length,
      successful: this.results.filter(r => r.success).length,
      failed: this.results.filter(r => r.success === false).length,
      totalDuration: this.results.reduce((sum, r) => sum + r.duration, 0),
      results: this.results
    };

    try {
      writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
      console.log(`\n📄 Summary saved to: ${summaryFile}`);
    } catch (error) {
      console.error('❌ Failed to save summary:', error);
    }
  }

  private printSummary(): void {
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.length - successful;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(60));
    console.log('📊 ENDPOINT TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`🌐 Base URL: ${this.baseUrl}`);
    console.log(`📈 Total Tests: ${this.results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📊 Success Rate: ${((successful / this.results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ FAILED ENDPOINTS:');
      this.results.filter(r => !r.success).forEach(r => {
        console.log(`   ${r.endpoint}: ${r.error || `HTTP ${r.status}`}`);
      });
    }

    console.log(`\n📁 All responses saved to: ${this.outputDir}`);
    console.log('='.repeat(60));
  }

  public async testAllEndpoints(): Promise<void> {
    const endpoints = this.getEndpointsToTest();
    
    console.log(`🎯 Testing ${endpoints.length} endpoints...\n`);

    for (const endpoint of endpoints) {
      const result = await this.makeRequest(endpoint);
      this.results.push(result);
      this.saveResult(result);
      
      // Small delay between requests to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.saveSummary();
    this.printSummary();
  }
}

// CLI interface
function printUsage(): void {
  console.log(`
Usage: npm run test:endpoints <base_url>

Examples:
  npm run test:endpoints http://localhost:3000
  npm run test:endpoints https://api.example.com
  tsx test-endpoints.ts http://localhost:3000

Options:
  base_url    The base URL of the server to test (required)
  
Output:
  - Individual JSON files for each endpoint response
  - Summary file with all results
  - Console output with real-time progress
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

  const tester = new EndpointTester(baseUrl);
  
  try {
    await tester.testAllEndpoints();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  process.exit(1);
});

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}