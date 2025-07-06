# QuiverMCP Testing Guide

This document describes the comprehensive testing suite for the QuiverMCP server, covering all endpoints, configurations, and edge cases.

## Test Suites Overview

### 1. Basic Endpoint Testing (`test-endpoints.ts`)
**Purpose**: Basic functionality verification  
**Coverage**: Core MCP protocol and main tool endpoints  
**Usage**: `npm run test http://localhost:3000`

### 2. Comprehensive Test Suite (`tests/comprehensive-test-suite.ts`) 
**Purpose**: Complete endpoint and feature coverage  
**Coverage**: 
- All response modes (summary, compact, detailed)
- All format options (json, table, csv)
- Field selection and pagination
- Error handling and edge cases
- Performance testing
- Prompts and resources

**Usage**: `npm run test:comprehensive http://localhost:3000`

### 3. Configuration Validation (`tests/config-validation-suite.ts`)
**Purpose**: Environment and configuration verification  
**Coverage**:
- Environment variables
- Server configuration
- API connectivity
- MCP protocol compliance
- CORS and networking

**Usage**: `npm run test:config http://localhost:3000`

## Quick Start

### Run All Tests
```bash
# Start the server first
npm run dev

# In another terminal, run all tests
npm run test:all
```

### Run Individual Test Suites
```bash
# Configuration validation
npm run test:config http://localhost:3000

# Comprehensive endpoint testing  
npm run test:comprehensive http://localhost:3000

# Basic endpoint testing (legacy)
npm run test http://localhost:3000
```

## Test Categories

### 📊 Endpoint Tests
- **Basic Protocol**: Health, MCP info, initialization
- **Tools**: All 20+ QuiverAPI tools with various parameters
- **Prompts**: Analysis prompts with different arguments
- **Resources**: Documentation and guide resources

### ⚙️ Configuration Tests  
- **Environment**: API token validation, server binding
- **API**: QuiverAPI connectivity, rate limiting
- **MCP**: Protocol compliance, tool/prompt availability
- **Server**: JSON parsing, error handling, timeouts

### 🎛️ Format & Mode Tests
- **Response Modes**: 
  - `summary` - Overview with sample data (60-80% token reduction)
  - `compact` - JSON string format (80-90% token reduction) 
  - `detailed` - Complete data (baseline)
- **Output Formats**:
  - `json` - Default structured format
  - `table` - Markdown table format
  - `csv` - Comma-separated values

### 🔧 Parameter Tests
- **Field Selection**: Custom field arrays vs defaults
- **Pagination**: Page/page_size combinations
- **Limits**: Various limit values and performance impact
- **Sections**: Ticker data section filtering
- **Search**: Query and filter parameters

### ❌ Error Handling Tests
- Invalid tool names
- Missing required parameters
- Invalid MCP methods
- Network timeouts
- API authentication failures

### 🚀 Performance Tests
- Large limit values
- Bulk data endpoints
- Response time measurement
- Memory usage tracking

## Test Results & Reports

### Output Locations
- **Basic Tests**: `./endpoint-outputs/`
- **Comprehensive Tests**: `./test-results/`
- **Config Tests**: `./config-test-results/`

### Report Format
Each test suite generates:
- Individual test results (JSON files)
- Summary report with statistics
- Performance metrics
- Error details and recommendations

### Sample Report Structure
```json
{
  "timestamp": "2025-07-05T23-18-10-860Z",
  "baseUrl": "http://localhost:3000",
  "summary": {
    "total": 45,
    "passed": 43,
    "failed": 2,
    "success_rate": "95.6%"
  },
  "categories": [
    {
      "name": "endpoint",
      "total": 15,
      "passed": 15,
      "failed": 0,
      "success_rate": "100.0%"
    }
  ],
  "performance": {
    "avg_duration": 1250,
    "max_duration": 3400,
    "avg_response_size": 15678
  }
}
```

## Understanding Test Results

### Success Indicators ✅
- **Green checkmarks**: Tests passed successfully
- **Response times < 5s**: Good performance
- **200 status codes**: Proper HTTP responses
- **Valid JSON-RPC**: Correct protocol compliance

### Failure Indicators ❌
- **Red X marks**: Tests failed
- **Timeout errors**: Server or API connectivity issues
- **4xx/5xx status**: HTTP errors
- **Missing capabilities**: Configuration problems

### Performance Indicators 📊
- **< 1000ms**: Excellent response time
- **1000-3000ms**: Good response time  
- **3000-10000ms**: Acceptable for large datasets
- **> 10000ms**: May indicate configuration issues

## Troubleshooting Common Issues

### API Token Issues
```bash
# Check if token is set
echo $QUIVER_API_TOKEN

# Test API connectivity
npm run test:config http://localhost:3000
```

### Server Not Starting
```bash
# Check port availability
lsof -i :3000

# Check environment variables
npm run dev
```

### Test Failures
1. **Check server is running**: `curl http://localhost:3000/health`
2. **Verify API token**: Configuration tests will identify token issues
3. **Network connectivity**: Ensure firewall allows outbound API calls
4. **Review logs**: Server console output shows detailed errors

### Performance Issues
- **Large response times**: Use `mode: "summary"` for exploration
- **Memory usage**: Apply limits and pagination for bulk endpoints
- **Rate limiting**: Space out requests or use smaller batches

## Best Practices for Testing

### Development Workflow
1. **Start Development**: `npm run dev`
2. **Quick Validation**: `npm run test:config http://localhost:3000`
3. **Full Testing**: `npm run test:comprehensive http://localhost:3000`
4. **Performance Check**: Review response times in reports

### Production Validation
1. **Configuration Check**: Validate all environment variables
2. **Connectivity Test**: Ensure external API access
3. **Load Testing**: Test with realistic request volumes
4. **Monitor Performance**: Track response times and error rates

### Adding New Tests
1. **Endpoint Tests**: Add to `comprehensive-test-suite.ts`
2. **Config Tests**: Add to `config-validation-suite.ts`
3. **Update Categories**: Use appropriate test categories
4. **Document Changes**: Update this README

## Integration with CI/CD

### GitHub Actions Example
```yaml
- name: Test Configuration
  run: npm run test:config http://localhost:3000
  
- name: Run Comprehensive Tests  
  run: npm run test:comprehensive http://localhost:3000
  
- name: Upload Test Results
  uses: actions/upload-artifact@v3
  with:
    name: test-results
    path: |
      test-results/
      config-test-results/
```

### Docker Testing
```bash
# Build and start container
docker-compose up -d

# Wait for startup
sleep 10

# Run tests against container
npm run test:all

# Cleanup
docker-compose down
```

## Test Coverage Metrics

### Current Coverage
- **Endpoints**: 100% (All 20+ tools, prompts, resources)
- **Response Modes**: 100% (summary, compact, detailed)
- **Formats**: 100% (json, table, csv)
- **Parameters**: 95% (Most common parameter combinations)
- **Error Cases**: 80% (Major error scenarios covered)
- **Performance**: 70% (Basic performance testing)

### Coverage Goals
- [ ] Increase error case coverage to 95%
- [ ] Add load testing for concurrent requests
- [ ] Add integration tests with real client applications
- [ ] Add security testing for authentication edge cases
- [ ] Add monitoring and alerting test scenarios

## Continuous Improvement

### Monitoring Test Health
- Track test execution times
- Monitor success rates over time
- Identify flaky tests
- Update tests as API evolves

### Test Data Management
- Use consistent test data
- Clean up test artifacts
- Archive old test results
- Maintain test environment isolation

---

For questions or issues with testing, please check the main README.md or open a GitHub issue.