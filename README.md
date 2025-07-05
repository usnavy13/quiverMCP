# QuiverAPI MCP Server

A Model Context Protocol (MCP) server that provides access to QuiverAPI's Tier 1 endpoints for financial and political data. Designed for integration with LibreChat and other MCP clients.

[![Docker Build](https://github.com/YOUR_USERNAME/quiverMCP/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/YOUR_USERNAME/quiverMCP/actions/workflows/docker-publish.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/ghcr.io/YOUR_USERNAME/quivermcp)](https://github.com/YOUR_USERNAME/quiverMCP/pkgs/container/quivermcp)

## 🌟 Full MCP Protocol Support

This server implements the complete Model Context Protocol specification, including:

- ✅ **Core Protocol**: `initialize`, `initialized`, `ping`
- ✅ **Tools**: `tools/list`, `tools/call` (21 QuiverAPI endpoints)
- ✅ **Resources**: `resources/list`, `resources/read` (extensible)
- ✅ **Prompts**: `prompts/list`, `prompts/get` (extensible)
- ✅ **Utilities**: `$/cancelRequest`, health checks
- ✅ **Capability Negotiation**: Full feature discovery
- ✅ **LibreChat Compatible**: Streamable HTTP transport

## 🚀 Features

This MCP server provides access to 21 Tier 1 endpoints from QuiverAPI, including:

- **Congress Trading**: Live and historical trading data for U.S. Congress members
- **Government Contracts**: Recent and historical government contract data
- **Lobbying Data**: Live and historical lobbying spending information
- **Bill Summaries**: Recent bill summaries and legislation data
- **Company & Fund Data**: Lists of companies and SEC 13F fund information
- **Off-Exchange Data**: Daily off-exchange trading activity

## 📋 Prerequisites

- Docker and Docker Compose (recommended)
- OR Node.js 18+ (for manual installation)
- A valid QuiverAPI token ([Get one here](https://www.quiverquant.com/))

## 🐳 Docker Installation (Recommended)

### Quick Start with Pre-built Image

```bash
# Using GitHub Container Registry (recommended)
docker run -d \
  --name quiver-mcp-server \
  -p 3000:3000 \
  -e QUIVER_API_TOKEN=your_token_here \
  ghcr.io/YOUR_USERNAME/quivermcp:latest
```

### Quick Start with Docker Compose

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/quiverMCP.git
   cd quiverMCP
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your QuiverAPI token
   ```

3. **Start the server**
   ```bash
   docker-compose up -d
   ```

4. **Verify it's running**
   ```bash
   curl http://localhost:3000/health
   ```

### Manual Docker Build

```bash
# Build the image locally
docker build -t quiver-mcp-server .

# Run the container
docker run -d \
  --name quiver-mcp-server \
  -p 3000:3000 \
  -e QUIVER_API_TOKEN=your_token_here \
  quiver-mcp-server
```

## 🔧 Manual Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your QuiverAPI token
   ```

3. **Build and start**
   ```bash
   npm run build
   npm start
   ```

## 🌐 Configuration

### Environment Variables

- `QUIVER_API_TOKEN`: Your QuiverAPI authentication token (**required**)
- `QUIVER_BASE_URL`: Base URL for QuiverAPI (default: https://api.quiverquant.com)
- `PORT`: Server port (default: 3000)
- `LIBRECHAT_ORIGIN`: CORS origin for LibreChat (default: *)

### Example .env file
```bash
QUIVER_API_TOKEN=your_quiver_api_token_here
QUIVER_BASE_URL=https://api.quiverquant.com
PORT=3000
LIBRECHAT_ORIGIN=http://localhost:3080
```

## 🤖 LibreChat Integration

### Step 1: Configure LibreChat

Add the following to your LibreChat configuration file (`librechat.yaml`):

```yaml
# MCP Server Configuration
mcpServers:
  quiver:
    name: "QuiverAPI"
    description: "Access to QuiverAPI financial and political data"
    url: "http://localhost:3000"
    # For Docker deployment:
    # url: "http://quiver-mcp-server:3000"
    transport: "http"
    endpoints:
      - "/message"
    tools:
      - name: "financial_data"
        description: "Access QuiverAPI financial data"
```

### Step 2: LibreChat Docker Compose Integration

If you're running LibreChat with Docker, add the MCP server to your docker-compose.yml:

```yaml
version: '3.8'

services:
  librechat:
    # ... your LibreChat configuration
    depends_on:
      - quiver-mcp-server
    environment:
      - MCP_QUIVER_URL=http://quiver-mcp-server:3000
    networks:
      - librechat-network

  quiver-mcp-server:
    build:
      context: ./quiverMCP
      dockerfile: Dockerfile
    container_name: quiver-mcp-server
    environment:
      - QUIVER_API_TOKEN=${QUIVER_API_TOKEN}
      - QUIVER_BASE_URL=https://api.quiverquant.com
      - PORT=3000
    networks:
      - librechat-network
    restart: unless-stopped

networks:
  librechat-network:
    driver: bridge
```

### Step 3: Using in LibreChat

Once configured, you can use the QuiverAPI tools in your LibreChat conversations:

```
Show me recent Congress trading activity for AAPL
```

```
What are the latest government contracts awarded?
```

```
Get lobbying data for Microsoft
```

## 🔨 Available Tools

### Company & Fund Data
- `get_companies` - Get list of companies
- `get_funds` - Get fund information from SEC 13F data

### Congress Trading
- `get_recent_congress_trading` - Recent Congress transactions
- `get_congress_holdings` - Live Congress holdings data
- `get_historical_congress_trading` - Historical Congress trading for a ticker
- `get_recent_house_trading` - Recent House transactions
- `get_recent_senate_trading` - Recent Senate transactions
- `get_historical_house_trading` - Historical House trading for a ticker
- `get_historical_senate_trading` - Historical Senate trading for a ticker
- `get_bulk_congress_trading` - Full history of Congress transactions

### Government Contracts
- `get_recent_gov_contracts` - Recent government contracts
- `get_recent_gov_contracts_all` - All recently announced contracts
- `get_historical_gov_contracts` - Historical quarterly contracts for a ticker
- `get_historical_gov_contracts_all` - All historical contracts for a ticker

### Lobbying Data
- `get_recent_lobbying` - Recent lobbying spending instances
- `get_historical_lobbying` - Historical lobbying data for a ticker

### Legislation
- `get_recent_bill_summaries` - Recent bill summaries
- `get_recent_legislation` - Recent legislation data

### Market Data
- `get_live_off_exchange` - Yesterday's off-exchange activity
- `get_historical_off_exchange` - Historical off-exchange activity for a ticker
- `get_ticker_data` - Comprehensive ticker data

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### MCP Info
```bash
curl http://localhost:3000/mcp
```

### MCP Protocol Testing

```bash
# Test ping (health check)
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"ping"}'

# Test initialize (capability negotiation)
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":2,
    "method":"initialize",
    "params":{
      "protocolVersion":"2024-11-05",
      "capabilities":{"roots":{"listChanged":true}}
    }
  }'

# Test tools list
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/list"}'

# Test resources list
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":4,"method":"resources/list"}'

# Test prompts list  
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":5,"method":"prompts/list"}'
```

### Example Tool Usage
```bash
# Test QuiverAPI tool (requires valid token)
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":6,
    "method":"tools/call",
    "params": {
      "name": "get_recent_congress_trading",
      "arguments": {
        "normalized": true
      }
    }
  }'
```

## 🔄 Development

### Running in Development Mode

```bash
# HTTP server (for LibreChat)
npm run dev

# Stdio server (for Claude Desktop)
npm run dev:stdio
```

### Building

```bash
npm run build
```

### Watching for Changes

```bash
npm run watch
```

## 🚦 Server Modes

This server supports two transport modes:

1. **HTTP Mode** (default): For LibreChat and web-based MCP clients
   - Endpoint: `http://localhost:3000/message`
   - Start with: `npm start`

2. **Stdio Mode**: For Claude Desktop and CLI-based MCP clients
   - Uses stdin/stdout communication
   - Start with: `npm run start:stdio`

## 📊 Monitoring

### Docker Logs
```bash
docker logs quiver-mcp-server -f
```

### Health Monitoring
The server includes health checks that monitor:
- Server responsiveness
- API token validity
- Tool availability

## 🛡️ Security

- Non-root user execution in Docker
- CORS protection for web access
- Input validation for all parameters
- Secure environment variable handling

## 🔧 Troubleshooting

### Common Issues

1. **Server won't start**
   - Check that `QUIVER_API_TOKEN` is set
   - Verify the token is valid
   - Check port 3000 is available

2. **API calls failing**
   - Verify your QuiverAPI token has sufficient permissions
   - Check network connectivity
   - Review server logs for detailed errors

3. **LibreChat integration issues**
   - Ensure the MCP server URL is correct in LibreChat config
   - Check CORS settings if accessing from different origins
   - Verify both services are on the same Docker network

### Debug Commands

```bash
# Check server status
curl http://localhost:3000/health

# View available tools
curl http://localhost:3000/mcp

# Check Docker logs
docker logs quiver-mcp-server

# Test tool manually
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -d '{"method": "tools/list"}'
```

## 📈 Performance

- Lightweight Alpine Linux base image
- Efficient Node.js runtime
- Connection pooling for API requests
- Health checks for reliability

## 📦 Container Registry

Pre-built Docker images are automatically published to GitHub Container Registry on every release:

- **Latest stable**: `ghcr.io/YOUR_USERNAME/quivermcp:latest`
- **Specific version**: `ghcr.io/YOUR_USERNAME/quivermcp:v1.0.0`
- **Branch builds**: `ghcr.io/YOUR_USERNAME/quivermcp:main`

### Available Tags

- `latest` - Latest stable release
- `main` - Latest from main branch  
- `v1.x.x` - Specific version releases
- `v1.x` - Major.minor releases
- `v1` - Major releases

### Multi-Platform Support

Images are built for:
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (ARM 64-bit, including Apple Silicon)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### Automated Releases

- Push to `main` → Triggers Docker build and publishes `latest` tag
- Create tag `v*` → Triggers release build and GitHub release
- Pull requests → Builds for testing (no publish)

## 📄 License

MIT License - see the LICENSE file for details.

## 🆘 Support

For issues related to:
- **This MCP server**: Check the logs and ensure your QuiverAPI token is valid
- **QuiverAPI**: Contact QuiverAPI support
- **LibreChat**: Check LibreChat documentation and community

## 🔗 Links

- [QuiverAPI Documentation](https://www.quiverquant.com/api)
- [LibreChat Documentation](https://docs.librechat.ai/)
- [MCP Protocol Specification](https://modelcontextprotocol.io/)