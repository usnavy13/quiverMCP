#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { QuiverClient } from './quiver-client.js';
import { QuiverConfig } from './types.js';
import { quiverTools } from './tools.js';
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

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Quiver MCP Server running on stdio');
  console.error(`Base URL: ${config.baseUrl}`);
  console.error(`Available tools: ${tools.length}`);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});