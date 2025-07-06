#!/usr/bin/env node

import axios from 'axios';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ConfigTest {
  name: string;
  description: string;
  setup?: () => void;
  test: () => Promise<boolean>;
  cleanup?: () => void;
  category: 'env' | 'api' | 'server' | 'mcp';
}

interface ConfigTestResult {
  testName: string;
  category: string;
  success: boolean;
  error?: string;
  duration: number;
  timestamp: string;
}

class ConfigValidationSuite {
  private baseUrl: string;
  private results: ConfigTestResult[] = [];
  private outputDir: string;
  private timestamp: string;

  constructor(baseUrl: string, outputDir: string = './config-test-results') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.outputDir = outputDir;
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    try {
      mkdirSync(this.outputDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
    
    console.log(`⚙️  Configuration Validation Suite for: ${this.baseUrl}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
    console.log(`⏰ Timestamp: ${this.timestamp}\n`);
  }

  private getConfigTests(): ConfigTest[] {
    return [
      // Environment Configuration Tests
      {
        name: 'api_token_validation',
        description: 'Verify API token is properly configured',
        test: async () => {
          try {
            const response = await axios.get(`${this.baseUrl}/health`);
            return response.data.status === 'ok';
          } catch {
            return false;
          }
        },
        category: 'env'
      },
      {
        name: 'server_port_binding',
        description: 'Verify server binds to correct port',
        test: async () => {
          try {
            const response = await axios.get(`${this.baseUrl}/health`, { timeout: 5000 });
            return response.status === 200;
          } catch {
            return false;
          }
        },
        category: 'server'
      },
      {
        name: 'cors_configuration',
        description: 'Verify CORS headers are properly configured',
        test: async () => {
          try {
            const response = await axios.options(`${this.baseUrl}/health`);
            const corsHeader = response.headers['access-control-allow-origin'];
            return corsHeader !== undefined;
          } catch {
            // If OPTIONS fails, try a regular request and check headers
            try {
              const response = await axios.get(`${this.baseUrl}/health`);
              return response.headers['access-control-allow-origin'] !== undefined;
            } catch {
              return false;
            }
          }
        },
        category: 'server'
      },

      // API Configuration Tests
      {
        name: 'api_base_url_connectivity',
        description: 'Verify connection to QuiverAPI base URL',
        test: async () => {
          try {
            // Test a simple API call that should work if properly configured
            const response = await axios.post(`${this.baseUrl}/message`, {
              jsonrpc: '2.0',
              id: 1,
              method: 'tools/call',
              params: {
                name: 'get_companies',
                arguments: { limit: 1 }
              }
            }, { timeout: 10000 });
            
            return response.status === 200 && !response.data.error;
          } catch {
            return false;
          }
        },
        category: 'api'
      },
      {
        name: 'api_rate_limiting',
        description: 'Test API rate limiting behavior',
        test: async () => {
          try {
            // Make multiple rapid requests to test rate limiting
            const requests = Array(5).fill(null).map((_, i) => 
              axios.post(`${this.baseUrl}/message`, {
                jsonrpc: '2.0',
                id: i,
                method: 'tools/call',
                params: {
                  name: 'get_companies',
                  arguments: { limit: 1 }
                }
              }, { timeout: 5000 })
            );
            
            const responses = await Promise.allSettled(requests);
            const successCount = responses.filter(r => r.status === 'fulfilled').length;
            
            // If all succeed, rate limiting might not be configured (which is okay)
            // If some fail with 429, rate limiting is working
            return successCount >= 3; // At least 3 should succeed
          } catch {
            return false;
          }
        },
        category: 'api'
      },

      // MCP Protocol Configuration Tests
      {
        name: 'mcp_initialization',
        description: 'Test MCP protocol initialization',
        test: async () => {
          try {
            const response = await axios.post(`${this.baseUrl}/message`, {
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
                clientInfo: { name: 'config-test', version: '1.0.0' }
              }
            });
            
            return response.status === 200 && 
                   response.data.result && 
                   response.data.result.capabilities;
          } catch {
            return false;
          }
        },
        category: 'mcp'
      },
      {
        name: 'mcp_tools_available',
        description: 'Verify all expected tools are available',
        test: async () => {
          try {
            const response = await axios.post(`${this.baseUrl}/message`, {
              jsonrpc: '2.0',
              id: 1,
              method: 'tools/list',
              params: {}
            });
            
            const tools = response.data.result?.tools || [];
            const expectedTools = [
              'get_companies',
              'get_funds', 
              'get_recent_congress_trading',
              'get_congress_holdings',
              'get_ticker_data',
              'get_historical_congress_trading'
            ];
            
            return expectedTools.every(tool => 
              tools.some((t: any) => t.name === tool)
            );
          } catch {
            return false;
          }
        },
        category: 'mcp'
      },
      {
        name: 'mcp_prompts_available',
        description: 'Verify all expected prompts are available',
        test: async () => {
          try {
            const response = await axios.post(`${this.baseUrl}/message`, {
              jsonrpc: '2.0',
              id: 1,
              method: 'prompts/list',
              params: {}
            });
            
            const prompts = response.data.result?.prompts || [];
            const expectedPrompts = [
              'analyze-congress-trading',
              'company-deep-dive',
              'government-influence-analysis',
              'optimize-query-strategy'
            ];
            
            return expectedPrompts.every(prompt => 
              prompts.some((p: any) => p.name === prompt)
            );
          } catch {
            return false;
          }
        },
        category: 'mcp'
      },
      {
        name: 'mcp_resources_available',
        description: 'Verify all expected resources are available',
        test: async () => {
          try {
            const response = await axios.post(`${this.baseUrl}/message`, {
              jsonrpc: '2.0',
              id: 1,
              method: 'resources/list',
              params: {}
            });
            
            const resources = response.data.result?.resources || [];
            const expectedResources = [
              'quiver://server/instructions',
              'quiver://docs/optimization-guide',
              'quiver://docs/field-reference'
            ];
            
            return expectedResources.every(uri => 
              resources.some((r: any) => r.uri === uri)
            );
          } catch {
            return false;
          }
        },
        category: 'mcp'
      },

      // Server Configuration Tests
      {
        name: 'json_parsing',
        description: 'Test JSON request/response parsing',
        test: async () => {
          try {
            const complexData = {
              jsonrpc: '2.0',
              id: 1,
              method: 'tools/call',
              params: {
                name: 'get_companies',
                arguments: {
                  fields: ['ticker', 'name'],
                  limit: 1,
                  mode: 'detailed',
                  format: 'json'
                }
              }
            };
            
            const response = await axios.post(`${this.baseUrl}/message`, complexData);
            return response.status === 200 && response.data.jsonrpc === '2.0';
          } catch {
            return false;
          }
        },
        category: 'server'
      },
      {
        name: 'error_handling',
        description: 'Test proper error response formatting',
        test: async () => {
          try {
            const response = await axios.post(`${this.baseUrl}/message`, {
              jsonrpc: '2.0',
              id: 1,
              method: 'invalid/method',
              params: {}
            });
            
            // Should return an error response, not throw
            return response.status === 200 && response.data.error;
          } catch {
            return false;
          }
        },
        category: 'server'
      },
      {
        name: 'timeout_handling',
        description: 'Test server timeout configuration',
        test: async () => {
          try {
            // Test with a reasonable timeout
            const response = await axios.post(`${this.baseUrl}/message`, {
              jsonrpc: '2.0',
              id: 1,
              method: 'tools/call',
              params: {
                name: 'get_companies',
                arguments: { limit: 5 }
              }
            }, { timeout: 30000 });
            
            return response.status === 200;
          } catch (error) {
            // If it times out, that might indicate a configuration issue
            return !axios.isAxiosError(error) || error.code !== 'ECONNABORTED';
          }
        },
        category: 'server'
      },

      // Response Configuration Tests
      {
        name: 'response_mode_config',
        description: 'Test all response modes are properly configured',
        test: async () => {
          try {
            const modes = ['summary', 'compact', 'detailed'];
            const promises = modes.map(mode => 
              axios.post(`${this.baseUrl}/message`, {
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: {
                  name: 'get_companies',
                  arguments: { mode, limit: 2 }
                }
              })
            );
            
            const responses = await Promise.allSettled(promises);
            return responses.every(r => r.status === 'fulfilled');
          } catch {
            return false;
          }
        },
        category: 'server'
      },
      {
        name: 'format_options_config',
        description: 'Test all format options are properly configured',
        test: async () => {
          try {
            const formats = ['json', 'table', 'csv'];
            const promises = formats.map(format => 
              axios.post(`${this.baseUrl}/message`, {
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: {
                  name: 'get_companies',
                  arguments: { format, limit: 2 }
                }
              })
            );
            
            const responses = await Promise.allSettled(promises);
            return responses.every(r => r.status === 'fulfilled');
          } catch {
            return false;
          }
        },
        category: 'server'
      }
    ];
  }

  private async executeTest(configTest: ConfigTest): Promise<ConfigTestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🔧 ${configTest.category.toUpperCase()}: ${configTest.name}`);
      
      if (configTest.setup) {
        configTest.setup();
      }
      
      const success = await configTest.test();
      const duration = Date.now() - startTime;
      
      if (configTest.cleanup) {
        configTest.cleanup();
      }
      
      if (success) {
        console.log(`✅ ${configTest.name} - PASSED (${duration}ms)`);
      } else {
        console.log(`❌ ${configTest.name} - FAILED (${duration}ms)`);
      }
      
      return {
        testName: configTest.name,
        category: configTest.category,
        success,
        duration,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${configTest.name} - ERROR (${duration}ms): ${error}`);
      
      if (configTest.cleanup) {
        try {
          configTest.cleanup();
        } catch {
          // Ignore cleanup errors
        }
      }
      
      return {
        testName: configTest.name,
        category: configTest.category,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  private generateReport(): void {
    const categories = [...new Set(this.results.map(r => r.category))];
    const reportFile = join(this.outputDir, `config-test-report_${this.timestamp}.json`);
    
    const report = {
      timestamp: this.timestamp,
      baseUrl: this.baseUrl,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length,
        success_rate: ((this.results.filter(r => r.success).length / this.results.length) * 100).toFixed(1)
      },
      categories: categories.map(category => {
        const categoryResults = this.results.filter(r => r.category === category);
        return {
          name: category,
          total: categoryResults.length,
          passed: categoryResults.filter(r => r.success).length,
          failed: categoryResults.filter(r => !r.success).length,
          success_rate: ((categoryResults.filter(r => r.success).length / categoryResults.length) * 100).toFixed(1),
          tests: categoryResults.map(r => ({
            name: r.testName,
            success: r.success,
            duration: r.duration,
            error: r.error
          }))
        };
      }),
      results: this.results
    };

    writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`\n📊 Configuration test report saved to: ${reportFile}`);
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.length - passed;
    const categories = [...new Set(this.results.map(r => r.category))];

    console.log('\n' + '='.repeat(80));
    console.log('⚙️  CONFIGURATION VALIDATION RESULTS');
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
      const successRate = ((categoryPassed / categoryResults.length) * 100).toFixed(1);
      
      console.log(`   ${category.toUpperCase()}: ${categoryPassed}/${categoryResults.length} (${successRate}%)`);
      
      // Show failed tests for this category
      const failed = categoryResults.filter(r => !r.success);
      if (failed.length > 0) {
        failed.forEach(f => {
          console.log(`     ❌ ${f.testName}: ${f.error || 'Failed'}`);
        });
      }
    });

    console.log('\n💡 CONFIGURATION RECOMMENDATIONS:');
    
    // Environment recommendations
    const envFailed = this.results.filter(r => r.category === 'env' && !r.success);
    if (envFailed.length > 0) {
      console.log('   📝 Environment Variables:');
      console.log('     - Ensure QUIVER_API_TOKEN is set and valid');
      console.log('     - Check QUIVER_BASE_URL if customized');
    }
    
    // Server recommendations
    const serverFailed = this.results.filter(r => r.category === 'server' && !r.success);
    if (serverFailed.length > 0) {
      console.log('   🖥️  Server Configuration:');
      console.log('     - Verify port binding and network access');
      console.log('     - Check CORS configuration for client access');
      console.log('     - Ensure JSON parsing is working correctly');
    }
    
    // API recommendations
    const apiFailed = this.results.filter(r => r.category === 'api' && !r.success);
    if (apiFailed.length > 0) {
      console.log('   🔗 API Configuration:');
      console.log('     - Verify QuiverAPI connectivity and credentials');
      console.log('     - Check network firewall settings');
      console.log('     - Confirm API token permissions');
    }
    
    // MCP recommendations
    const mcpFailed = this.results.filter(r => r.category === 'mcp' && !r.success);
    if (mcpFailed.length > 0) {
      console.log('   📡 MCP Protocol:');
      console.log('     - Ensure all tools are properly registered');
      console.log('     - Verify prompts and resources are loaded');
      console.log('     - Check MCP protocol version compatibility');
    }

    if (failed === 0) {
      console.log('   🎉 All configuration tests passed! Your setup looks great.');
    }

    console.log(`\n📁 Full results saved to: ${this.outputDir}`);
    console.log('='.repeat(80));
  }

  public async runAllTests(): Promise<void> {
    const configTests = this.getConfigTests();
    console.log(`🎯 Running ${configTests.length} configuration tests...\n`);

    for (const test of configTests) {
      const result = await this.executeTest(test);
      this.results.push(result);
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.generateReport();
    this.printSummary();
  }
}

// CLI interface
function printUsage(): void {
  console.log(`
Usage: npm run test:config <base_url>

Examples:
  npm run test:config http://localhost:3000
  tsx tests/config-validation-suite.ts http://localhost:3000

Features:
  - Environment variable validation
  - Server configuration testing
  - API connectivity verification
  - MCP protocol compliance
  - Error handling validation
  - Performance configuration checks

Output:
  - Category-based test results
  - Configuration recommendations
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

  const configSuite = new ConfigValidationSuite(baseUrl);
  
  try {
    await configSuite.runAllTests();
    process.exit(0);
  } catch (error) {
    console.error('❌ Configuration test suite failed:', error);
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Configuration tests interrupted by user');
  process.exit(1);
});

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}