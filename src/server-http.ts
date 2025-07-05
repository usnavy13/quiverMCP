#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { QuiverClient } from './quiver-client.js';
import { QuiverConfig } from './types.js';
import { quiverTools } from './tools.js';
import { quiverPrompts, getPrompt } from './prompts.js';
import { quiverResources, getResource } from './resources.js';
import express from 'express';
import cors from 'cors';
import { z } from 'zod';

// Configuration schema
const ConfigSchema = z.object({
  baseUrl: z.string().default('https://api.quiverquant.com'),
  apiToken: z.string()
});

// Get configuration from environment
const config: QuiverConfig = {
  baseUrl: process.env.QUIVER_BASE_URL || 'https://api.quiverquant.com',
  apiToken: process.env.QUIVER_API_TOKEN || ''
};

if (!config.apiToken) {
  console.error('QUIVER_API_TOKEN environment variable is required');
  process.exit(1);
}

// Initialize Quiver client
const quiverClient = new QuiverClient(config);

// Create MCP server
const server = new Server(
  {
    name: 'quiver-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      prompts: {
        listChanged: true
      },
      resources: {
        subscribe: true,
        listChanged: true
      },
    },
  }
);

// Convert tools to MCP format
const tools = quiverTools.map(tool => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema
}));

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools
  };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Find the tool
    const tool = quiverTools.find(t => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    // Execute the tool handler
    const result = await tool.handler(quiverClient, args);

    if (result.error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error} (Status: ${result.status})`
          }
        ],
        isError: true
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result.data, null, 2)
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      ],
      isError: true
    };
  }
});

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for LibreChat
app.use(cors({
  origin: process.env.LIBRECHAT_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    tools: tools.length,
    version: '1.0.0'
  });
});

// MCP endpoint info
app.get('/mcp', (req, res) => {
  res.json({
    name: 'quiver-mcp-server',
    version: '1.0.0',
    description: 'MCP server for QuiverAPI Tier 1 endpoints',
    tools: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }))
  });
});

// MCP endpoint - simplified HTTP implementation
app.post('/message', async (req, res) => {
  try {
    const { method, params } = req.body;
    
    let response;
    
    if (method === 'initialize') {
      response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {
              listChanged: true
            },
            prompts: {
              listChanged: true
            },
            resources: {
              listChanged: true,
              subscribe: true
            }
          },
          serverInfo: {
            name: 'quiver-mcp-server',
            version: '1.0.0'
          }
        }
      };
    } else if (method === 'initialized') {
      response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: {}
      };
    } else if (method === 'ping') {
      response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: {}
      };
    } else if (method === 'tools/list') {
      response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          tools: tools
        }
      };
    } else if (method === 'tools/call') {
      const { name, arguments: args } = params;
      
      // Find the tool
      const tool = quiverTools.find(t => t.name === name);
      if (!tool) {
        response = {
          jsonrpc: '2.0',
          id: req.body.id,
          error: {
            code: -32601,
            message: `Unknown tool: ${name}`
          }
        };
      } else {
        try {
          // Execute the tool handler
          const result = await tool.handler(quiverClient, args);
          
          if (result.error) {
            response = {
              jsonrpc: '2.0',
              id: req.body.id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `Error: ${result.error} (Status: ${result.status})`
                  }
                ],
                isError: true
              }
            };
          } else {
            // Check if result is already formatted by response utils
            const isFormattedResponse = result && typeof result === 'object' && 
              ('data' in result || 'summary' in result || 'pagination' in result);
            
            if (isFormattedResponse) {
              response = {
                jsonrpc: '2.0',
                id: req.body.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
                    }
                  ]
                }
              };
            } else {
              response = {
                jsonrpc: '2.0',
                id: req.body.id,
                result: {
                  content: [
                    {
                      type: 'text',
                      text: JSON.stringify(result.data)
                    }
                  ]
                }
              };
            }
          }
        } catch (error) {
          response = {
            jsonrpc: '2.0',
            id: req.body.id,
            error: {
              code: -32603,
              message: error instanceof Error ? error.message : String(error)
            }
          };
        }
      }
    } else if (method === 'resources/list') {
      response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          resources: quiverResources
        }
      };
    } else if (method === 'resources/read') {
      const { uri } = params;
      try {
        const resource = getResource(uri);
        response = {
          jsonrpc: '2.0',
          id: req.body.id,
          result: {
            contents: [
              {
                uri,
                mimeType: resource.mimeType,
                text: resource.contents
              }
            ]
          }
        };
      } catch (error) {
        response = {
          jsonrpc: '2.0',
          id: req.body.id,
          error: {
            code: -32601,
            message: `Unknown resource: ${uri}`
          }
        };
      }
    } else if (method === 'prompts/list') {
      response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          prompts: quiverPrompts.map(prompt => ({
            name: prompt.name,
            description: prompt.description,
            arguments: prompt.arguments
          }))
        }
      };
    } else if (method === 'prompts/get') {
      const { name, arguments: args } = params;
      try {
        const messages = getPrompt(name, args || {});
        response = {
          jsonrpc: '2.0',
          id: req.body.id,
          result: {
            messages
          }
        };
      } catch (error) {
        response = {
          jsonrpc: '2.0',
          id: req.body.id,
          error: {
            code: -32601,
            message: `Unknown prompt: ${name}`
          }
        };
      }
    } else if (method === '$/cancelRequest') {
      response = {
        jsonrpc: '2.0',
        id: req.body.id,
        result: {}
      };
    } else {
      response = {
        jsonrpc: '2.0',
        id: req.body.id,
        error: {
          code: -32601,
          message: `Unknown method: ${method}`
        }
      };
    }
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: req.body.id,
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : String(error)
      }
    });
  }
});

// Start server
async function main() {
  try {
    // Start Express server on all interfaces
    app.listen(Number(port), '0.0.0.0', () => {
      console.log(`🚀 Quiver MCP Server running on port ${port}`);
      console.log(`📊 Base URL: ${config.baseUrl}`);
      console.log(`🔧 Available tools: ${tools.length}`);
      console.log(`🏥 Health check: http://0.0.0.0:${port}/health`);
      console.log(`📋 MCP info: http://0.0.0.0:${port}/mcp`);
      console.log(`🔗 MCP endpoint: http://0.0.0.0:${port}/message`);
      console.log(`🌐 External access: http://192.168.1.227:${port}/message`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});