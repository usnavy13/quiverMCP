#!/usr/bin/env node

/**
 * Simple test script to verify STDIO MCP functionality
 * Usage: node test-stdio.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test cases
const testCases = [
  {
    name: 'Initialize',
    message: {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'test-client', version: '1.0.0' }
      }
    }
  },
  {
    name: 'List Tools',
    message: {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    }
  },
  {
    name: 'List Resources',
    message: {
      jsonrpc: '2.0',
      id: 3,
      method: 'resources/list'
    }
  },
  {
    name: 'List Prompts',
    message: {
      jsonrpc: '2.0',
      id: 4,
      method: 'prompts/list'
    }
  }
];

async function runTest() {
  console.log('🧪 Testing QuiverMCP STDIO Mode\n');
  
  // Set test environment
  const env = {
    ...process.env,
    QUIVER_API_TOKEN: 'test_token_for_stdio_test'
  };
  
  const serverPath = join(__dirname, 'build', 'index.js');
  
  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    
    try {
      const result = await testStdioMessage(serverPath, testCase.message, env);
      
      if (result.success) {
        console.log(`✅ ${testCase.name} - PASSED`);
        if (testCase.name === 'List Tools' && result.data?.result?.tools) {
          console.log(`   📊 Found ${result.data.result.tools.length} tools`);
        }
      } else {
        console.log(`❌ ${testCase.name} - FAILED: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name} - ERROR: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🏁 STDIO test completed');
}

function testStdioMessage(serverPath, message, env) {
  return new Promise((resolve) => {
    const child = spawn('node', [serverPath], {
      env,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    let resolved = false;
    
    // Set timeout
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        child.kill();
        resolve({ success: false, error: 'Timeout' });
      }
    }, 3000);
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
      
      // Try to parse JSON response
      try {
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
          if (line.startsWith('{')) {
            const response = JSON.parse(line);
            if (response.id === message.id && !resolved) {
              resolved = true;
              clearTimeout(timeout);
              child.kill();
              resolve({ success: true, data: response });
              return;
            }
          }
        }
      } catch (e) {
        // Continue collecting data
      }
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        if (code === 0) {
          resolve({ success: false, error: 'No response received' });
        } else {
          resolve({ success: false, error: `Process exited with code ${code}` });
        }
      }
    });
    
    child.on('error', (error) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve({ success: false, error: error.message });
      }
    });
    
    // Send the test message
    child.stdin.write(JSON.stringify(message) + '\n');
  });
}

// Run the test
runTest().catch(console.error);