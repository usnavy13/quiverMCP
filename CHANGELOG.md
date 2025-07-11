# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Full MCP Protocol support with all required methods
- GitHub Actions workflow for automated Docker builds
- GitHub Container Registry publishing
- Multi-platform Docker builds (linux/amd64, linux/arm64)
- Comprehensive MCP protocol testing endpoints
- Enhanced documentation with MCP protocol details
- Dedicated Claude Desktop integration section in README
- STDIO mode usage examples and testing instructions
- STDIO test suite for verifying MCP protocol functionality

### Changed
- Updated README with GitHub Container Registry usage
- Improved LibreChat integration documentation
- Reorganized README to prioritize STDIO/Claude Desktop usage
- Enhanced prerequisites section with mode-specific requirements
- Updated feature list to highlight Claude Desktop compatibility
- Enhanced Docker Compose configuration

### Fixed
- LibreChat connectivity issues by implementing ping method
- Complete MCP protocol compliance

## [1.0.0] - 2024-07-05

### Added
- Initial release with QuiverAPI MCP Server
- Support for 21 Tier 1 QuiverAPI endpoints
- LibreChat integration support
- Docker and Docker Compose deployment
- HTTP and stdio transport modes
- Comprehensive tool definitions for:
  - Congress trading data
  - Government contracts
  - Lobbying information
  - Bill summaries and legislation
  - Company and fund data
  - Off-exchange trading data
- Health checks and monitoring
- CORS support for web clients
- Environment-based configuration
- TypeScript implementation with full type safety

### Security
- Non-root user execution in Docker
- Secure environment variable handling
- Input validation for all parameters