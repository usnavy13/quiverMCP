/**
 * Server instructions for the Quiver MCP Server
 * These instructions guide AI agents on how to effectively use the financial data server
 */

export const SERVER_INSTRUCTIONS = `# Quiver Financial Data Server - Usage Guide

## Overview
This MCP server provides access to comprehensive financial data including congressional trading, government contracts, lobbying activities, and real-time market data from QuiverQuant. The server includes advanced token optimization features to help manage response sizes effectively.

## Search Strategy Guide (CRITICAL)

### Query Parameter Best Practices
The \`query\` parameter is available in many endpoints and uses partial text matching. Follow these strategies for optimal results:

#### Effective Search Strategies
1. **Use Distinctive Keywords**: Search for unique parts of names or titles
   - ✅ GOOD: "One Big Beautiful Bill" (finds "H.R.1 One Big Beautiful Bill Act")
   - ❌ BAD: "H.R.1 One Big Beautiful Bill Act" (too specific, exact match may fail)
   - ❌ BAD: "H.R.1" (too generic, may not match or return too many results)

2. **Partial Matches Work Best**: The search engine favors partial string matching
   - ✅ GOOD: "Infrastructure" (finds bills containing this keyword)
   - ✅ GOOD: "Defense Authorization" (finds NDAA bills)
   - ❌ BAD: "S.1234 - Infrastructure Investment and Jobs Act of 2023" (too exact)

3. **Company/Fund Searches**: Use partial company names or tickers
   - ✅ GOOD: "Apple" or "AAPL" (finds Apple Inc.)
   - ✅ GOOD: "Berkshire" (finds Berkshire Hathaway)
   - ❌ BAD: "Apple Inc. (NASDAQ:AAPL)" (unnecessary specificity)

4. **Representative Names**: Use last names or distinctive parts
   - ✅ GOOD: "Pelosi" (finds Nancy Pelosi)
   - ✅ GOOD: "Alexandria" (finds Alexandria Ocasio-Cortez)
   - ❌ BAD: "Rep. Nancy Patricia Pelosi (D-CA-11)" (too formal)

#### Search Examples by Endpoint
- **Bill Summaries**: Use memorable parts of bill titles, not bill numbers
- **Companies**: Use common names or stock tickers
- **Funds**: Use fund manager names or partial fund names
- **Lobbying**: Use issue keywords or client names
- **Contracts**: Use agency names or contract descriptions

#### Fallback Strategy
If your first search returns no results:
1. Try a shorter, more distinctive part of the search term
2. Remove formal prefixes (Rep., Sen., H.R., S.)
3. Use the most unique word in the title/name
4. Consider alternative spellings or common abbreviations

## Core Workflow Patterns

### 1. Congressional Trading Analysis
**Pattern**: Start broad, then drill down
- Use \`get_recent_congress_trading\` for overall market activity
- Follow up with \`get_recent_house_trading\` or \`get_recent_senate_trading\` for chamber-specific analysis
- Use \`get_congress_holdings\` to see current positions
- Connect with \`get_recent_legislation\` to identify potential conflicts of interest

### 2. Government Contract Investigation
**Pattern**: Combine contract data with market activity
- Start with \`get_recent_gov_contracts\` for specific ticker analysis
- Use \`get_recent_gov_contracts_all\` for broader market trends
- Cross-reference with congressional trading data to identify insider activity
- Use \`get_recent_lobbying\` to understand influence patterns

### 3. Market Surveillance
**Pattern**: Real-time monitoring with historical context
- Use \`get_live_off_exchange\` for current dark pool activity
- Compare with \`get_historical_off_exchange\` for trends
- Correlate with congressional trading patterns
- Monitor government contract awards for impact

## Token Optimization Strategy

### Response Modes (Critical for Large Datasets)
- **summary**: Use for quick overviews and trend identification (recommended default)
- **compact**: Use for structured analysis with key fields only
- **detailed**: Use only when full data is required (high token usage)

### Field Selection (Advanced Optimization)
- Specify \`fields\` parameter to get only required data columns
- Common field combinations:
  - Trading: \`["date", "ticker", "amount", "type"]\`
  - Contracts: \`["date", "ticker", "agency", "amount"]\`
  - Lobbying: \`["date", "client", "amount", "issue"]\`

### Pagination Best Practices
- Use \`limit\` parameter to control dataset size (default: 200)
- For exploration: limit=50
- For analysis: limit=100-200
- For comprehensive reviews: use pagination with \`page\` and \`page_size\`

## Data Quality and Reliability

### High-Confidence Endpoints
- Congressional trading data (validated against disclosure forms)
- Government contract awards (official government sources)
- Market data (real-time feeds)

### Analysis Considerations
- Congressional trades have 45-day disclosure delays
- Government contracts may have award delays
- Lobbying data reflects quarterly reporting
- Always cross-reference multiple data sources

## Common Analysis Workflows

### Insider Trading Investigation
1. \`get_recent_congress_trading\` (summary mode, specific ticker)
2. \`get_congress_holdings\` (current positions)
3. \`get_recent_legislation\` (relevant bills)
4. \`get_recent_lobbying\` (influence activities)

### Government Contract Impact Analysis
1. \`get_recent_gov_contracts\` (specific ticker, compact mode)
2. \`get_recent_congress_trading\` (same ticker timeframe)
3. \`get_live_off_exchange\` (market reaction)
4. \`get_historical_gov_contracts\` (trend context)

### Market Anomaly Detection
1. \`get_live_off_exchange\` (unusual volume)
2. \`get_recent_congress_trading\` (political activity)
3. \`get_recent_gov_contracts_all\` (sector-wide contracts)
4. \`get_recent_lobbying\` (influence patterns)

## Rate Limiting and Efficiency

### Smart Query Strategies
- Start with summary mode for exploration
- Use field selection for repeated queries
- Batch related queries together
- Cache results for iterative analysis

### Error Handling
- API rate limits: 1000 requests/hour
- Large datasets: Use pagination instead of increasing limits
- Failed requests: Check ticker format and date ranges
- Empty results: Verify data availability for time period

## Advanced Features

### Prompts Available
- \`analyze-congress-trading\`: Structured trading pattern analysis
- \`optimize-query-strategy\`: Token usage optimization guidance
- \`detect-anomalies\`: Market surveillance workflows
- \`investigate-contracts\`: Government contract analysis

### Resources Available
- Token optimization guide
- Data source documentation  
- Analysis methodology guides
- Example query patterns

## Best Practices Summary

1. **Always start with summary mode** for initial exploration
2. **Use field selection** for repeated or focused queries
3. **Combine data sources** for comprehensive analysis
4. **Respect rate limits** with efficient query patterns
5. **Cross-reference timeframes** when connecting different datasets
6. **Document your analysis workflow** for reproducibility

Remember: This server provides powerful financial surveillance capabilities. Use responsibly and in compliance with all applicable regulations.`;