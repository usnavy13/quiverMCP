# QuiverMCP Project Guide

## Project Overview

QuiverMCP is a Model Context Protocol (MCP) server that provides access to QuiverAPI's Tier 1 endpoints for financial and political data. This server is designed for integration with LibreChat and other MCP clients, implementing the complete MCP protocol specification.

### Key Technologies
- **TypeScript** with ES2022 target and ESNext modules
- **Node.js 18+** runtime
- **Express.js** for HTTP server transport
- **MCP SDK** (@modelcontextprotocol/sdk v1.15.0) for protocol implementation
- **Axios** for HTTP requests to QuiverAPI
- **Zod** for runtime type validation
- **Docker** for containerization

## Project Structure

```
src/
├── index.ts              # Main entry point for stdio mode
├── server-http.ts        # HTTP server for LibreChat integration
├── quiver-client.ts      # QuiverAPI client wrapper
├── tools.ts              # MCP tools implementation (21 endpoints)
├── resources.ts          # MCP resources implementation
├── prompts.ts            # MCP prompts implementation
├── response-utils.ts     # Response formatting utilities
├── types.ts              # TypeScript type definitions
├── tier1-endpoints.json  # QuiverAPI endpoint definitions
└── server-instructions.ts # Server instructions for prompts

tests/
├── comprehensive-test-suite.ts  # Full endpoint testing
└── config-validation-suite.ts   # Configuration validation

build/                    # Compiled TypeScript output
test-results/            # Test execution results
endpoint-outputs/        # API response samples
```

## Development Commands

### Essential Commands
```bash
# Development (watch mode)
npm run dev              # HTTP server for LibreChat
npm run dev:stdio        # Stdio server for Claude Desktop

# Building
npm run build           # Compile TypeScript to build/
npm run watch          # Watch mode compilation

# Production
npm start              # HTTP server (requires build)
npm run start:stdio    # Stdio server (requires build)

# Testing
npm run test                    # Basic endpoint testing
npm run test:comprehensive     # Full test suite
npm run test:config           # Configuration validation
npm run test:all              # All tests combined
```

### Docker Commands
```bash
# Development
docker-compose up -d    # Start with local build
docker-compose logs -f  # Follow logs

# Production
docker run -d \
  --name quiver-mcp-server \
  -p 3000:3000 \
  -e QUIVER_API_TOKEN=your_token \
  ghcr.io/usnavy13/quivermcp:latest
```

## Environment Configuration

### Required Environment Variables
```bash
QUIVER_API_TOKEN=your_quiver_api_token_here  # Required: QuiverAPI authentication
QUIVER_BASE_URL=https://api.quiverquant.com  # Optional: API base URL
PORT=3000                                    # Optional: Server port
LIBRECHAT_ORIGIN=*                          # Optional: CORS origin
```

### Configuration Files
- `.env` - Local environment variables (copy from `.env.example`)
- `tsconfig.json` - TypeScript compiler configuration
- `docker-compose.yml` - Docker development setup
- `Dockerfile` - Production container build

## API Architecture

### MCP Protocol Implementation
The server implements the complete MCP specification:

1. **Core Protocol**: `initialize`, `initialized`, `ping`
2. **Tools**: 21 QuiverAPI endpoints as callable tools
3. **Resources**: Documentation and guides
4. **Prompts**: Pre-built analysis templates
5. **Utilities**: Health checks, capability negotiation

### Transport Modes
1. **HTTP Mode** (default): For LibreChat integration
   - Endpoint: `http://localhost:3000/message`
   - CORS-enabled for web clients
   
2. **Stdio Mode**: For Claude Desktop and CLI clients
   - Uses stdin/stdout communication
   - Direct MCP protocol over streams

### QuiverAPI Integration
- **Client**: `src/quiver-client.ts` - Axios-based HTTP client
- **Endpoints**: 21 Tier 1 endpoints from `tier1-endpoints.json`
- **Authentication**: Bearer token via `QUIVER_API_TOKEN`
- **Rate Limiting**: Handled by QuiverAPI service

## Available Tools (21 Endpoints)

### Company & Fund Data
- `get_companies` - List of companies in QuiverAPI
- `get_funds` - SEC 13F fund information

### Congress Trading (8 endpoints)
- `get_recent_congress_trading` - Recent transactions (all Congress)
- `get_congress_holdings` - Live holdings data
- `get_historical_congress_trading` - Historical data by ticker
- `get_recent_house_trading` - House-specific recent trades
- `get_recent_senate_trading` - Senate-specific recent trades
- `get_historical_house_trading` - House historical by ticker
- `get_historical_senate_trading` - Senate historical by ticker
- `get_bulk_congress_trading` - Complete transaction history

### Government Contracts (4 endpoints)
- `get_recent_gov_contracts` - Recent contracts (quarterly)
- `get_recent_gov_contracts_all` - All recent contracts
- `get_historical_gov_contracts` - Historical quarterly by ticker
- `get_historical_gov_contracts_all` - All historical by ticker

### Lobbying Data (2 endpoints)
- `get_recent_lobbying` - Recent lobbying spending
- `get_historical_lobbying` - Historical lobbying by ticker

### Legislation (2 endpoints)
- `get_recent_bill_summaries` - Recent bill summaries
- `get_recent_legislation` - Recent legislation data

### Market Data (3 endpoints)
- `get_live_off_exchange` - Yesterday's off-exchange activity
- `get_historical_off_exchange` - Historical off-exchange by ticker
- `get_ticker_data` - Comprehensive ticker information

## Code Patterns & Conventions

### TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **ES2022 target** with ESNext modules
- **Node resolution** with synthetic default imports
- **Build output** to `./build/` directory

### Error Handling
```typescript
// Standard pattern in tools.ts and quiver-client.ts
try {
  const response = await client.makeRequest(endpoint, params);
  return { content: [{ type: "text", text: response }] };
} catch (error) {
  return { 
    content: [{ type: "text", text: `Error: ${error.message}` }],
    isError: true 
  };
}
```

### Response Formatting
- **Text responses** for data display
- **JSON formatting** for structured data
- **Error handling** with descriptive messages
- **Pagination support** where applicable

### Parameter Validation
- **Zod schemas** for runtime validation
- **Optional parameters** with sensible defaults
- **Type safety** throughout the codebase

## Testing Strategy

### Test Suites
1. **Basic Testing** (`npm run test`)
   - Health checks
   - MCP protocol compliance
   - Basic endpoint functionality

2. **Comprehensive Testing** (`npm run test:comprehensive`)
   - All 21 endpoints
   - Parameter variations
   - Error scenarios
   - Response format validation

3. **Configuration Testing** (`npm run test:config`)
   - Environment variable validation
   - API token verification
   - Server connectivity

### Test Results
- **Outputs saved** to `test-results/` with timestamps
- **JSON responses** for analysis and debugging
- **Test reports** with pass/fail summaries

## LibreChat Integration

### Configuration
Add to `librechat.yaml`:
```yaml
mcpServers:
  quiver:
    name: "QuiverAPI"
    description: "Access to QuiverAPI financial and political data"
    url: "http://localhost:3000"
    transport: "http"
    endpoints:
      - "/message"
```

### Docker Networking
- Ensure both LibreChat and QuiverMCP are on same network
- Use service names for container-to-container communication
- Configure CORS origins appropriately

## Security Considerations

### Authentication
- **API tokens** stored in environment variables only
- **No token logging** or exposure in responses
- **Secure headers** and CORS configuration

### Container Security
- **Non-root user** execution in Docker
- **Alpine Linux** base for minimal attack surface
- **Environment isolation** for secrets

### Input Validation
- **Parameter sanitization** via Zod schemas
- **SQL injection protection** (not applicable - API client only)
- **Rate limiting** handled by upstream QuiverAPI

## Performance & Monitoring

### Health Checks
- **Server health**: `GET /health`
- **MCP info**: `GET /mcp`
- **Protocol ping**: MCP ping method

### Logging
- **Structured logging** with timestamps
- **Error tracking** with stack traces
- **Request/response logging** for debugging

### Resource Usage
- **Lightweight footprint** (~50MB container
- **Efficient memory usage** with connection pooling
- **Fast startup time** (~2-3 seconds)

## Troubleshooting

### Common Issues
1. **Server won't start**
   - Check `QUIVER_API_TOKEN` is set and valid
   - Verify port 3000 is available
   - Review Docker logs for startup errors

2. **API calls failing**
   - Validate QuiverAPI token permissions
   - Check network connectivity to api.quiverquant.com
   - Review rate limiting and quota usage

3. **LibreChat integration**
   - Verify MCP server URL in LibreChat config
   - Check Docker network connectivity
   - Validate CORS settings for origin

### Debug Commands
```bash
# Server status
curl http://localhost:3000/health

# MCP capabilities
curl http://localhost:3000/mcp

# Manual tool testing
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'

# Container logs
docker logs quiver-mcp-server -f
```

## Recent Changes & Modifications

Based on git status, recent modifications include:
- **Enhanced API methods** with optional limit parameters
- **Improved tool definitions** with better parameter handling
- **Response utilities** for better data formatting
- **Expanded prompt and resource systems**

Files currently modified:
- `src/index.ts` - Main server entry point updates
- `src/quiver-client.ts` - API client enhancements
- `src/server-http.ts` - HTTP server improvements
- `src/tools.ts` - Tool definition updates

New files added:
- `src/prompts.ts` - MCP prompts implementation
- `src/resources.ts` - MCP resources system
- `src/response-utils.ts` - Response formatting utilities

## CI/CD Pipeline

### GitHub Actions
- **Automated builds** on push to main
- **Multi-platform images** (amd64, arm64)
- **Container registry** publishing to GHCR
- **Version tagging** on releases

### Docker Registry
- **Latest stable**: `ghcr.io/usnavy13/quivermcp:latest`
- **Version tags**: `ghcr.io/usnavy13/quivermcp:v1.0.0`
- **Branch builds**: `ghcr.io/usnavy13/quivermcp:main`