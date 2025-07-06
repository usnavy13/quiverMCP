# QuiverMCP LLM Content Reference

This document consolidates all LLM-facing content from the QuiverMCP server including tool descriptions, prompts, resources, and instructions.

## Table of Contents

1. [Server Instructions](#server-instructions)
2. [Tools (21 Endpoints)](#tools-21-endpoints)
3. [Resources (6 Guides)](#resources-6-guides)
4. [Prompts (4 Workflows)](#prompts-4-workflows)
5. [Response Optimization System](#response-optimization-system)
6. [API Endpoint Definitions](#api-endpoint-definitions)

---

## Server Instructions

**Source**: `src/server-instructions.ts`

### Quiver Financial Data Server - Usage Guide

#### Overview
This MCP server provides access to comprehensive financial data including congressional trading, government contracts, lobbying activities, and real-time market data from QuiverQuant. The server includes advanced token optimization features to help manage response sizes effectively.

#### Core Workflow Patterns

##### 1. Congressional Trading Analysis
**Pattern**: Start broad, then drill down
- Use `get_recent_congress_trading` for overall market activity
- Follow up with `get_recent_house_trading` or `get_recent_senate_trading` for chamber-specific analysis
- Use `get_congress_holdings` to see current positions
- Connect with `get_recent_legislation` to identify potential conflicts of interest

##### 2. Government Contract Investigation
**Pattern**: Combine contract data with market activity
- Start with `get_recent_gov_contracts` for specific ticker analysis
- Use `get_recent_gov_contracts_all` for broader market trends
- Cross-reference with congressional trading data to identify insider activity
- Use `get_recent_lobbying` to understand influence patterns

##### 3. Market Surveillance
**Pattern**: Real-time monitoring with historical context
- Use `get_live_off_exchange` for current dark pool activity
- Compare with `get_historical_off_exchange` for trends
- Correlate with congressional trading patterns
- Monitor government contract awards for impact

#### Token Optimization Strategy

##### Response Modes (Critical for Large Datasets)
- **summary**: Use for quick overviews and trend identification (recommended default)
- **compact**: Use for structured analysis with key fields only
- **detailed**: Use only when full data is required (high token usage)

##### Field Selection (Advanced Optimization)
- Specify `fields` parameter to get only required data columns
- Common field combinations:
  - Trading: `["date", "ticker", "amount", "type"]`
  - Contracts: `["date", "ticker", "agency", "amount"]`
  - Lobbying: `["date", "client", "amount", "issue"]`

##### Pagination Best Practices
- Use `limit` parameter to control dataset size (default: 200)
- For exploration: limit=50
- For analysis: limit=100-200
- For comprehensive reviews: use pagination with `page` and `page_size`

#### Data Quality and Reliability

##### High-Confidence Endpoints
- Congressional trading data (validated against disclosure forms)
- Government contract awards (official government sources)
- Market data (real-time feeds)

##### Analysis Considerations
- Congressional trades have 45-day disclosure delays
- Government contracts may have award delays
- Lobbying data reflects quarterly reporting
- Always cross-reference multiple data sources

#### Common Analysis Workflows

##### Insider Trading Investigation
1. `get_recent_congress_trading` (summary mode, specific ticker)
2. `get_congress_holdings` (current positions)
3. `get_recent_legislation` (relevant bills)
4. `get_recent_lobbying` (influence activities)

##### Government Contract Impact Analysis
1. `get_recent_gov_contracts` (specific ticker, compact mode)
2. `get_recent_congress_trading` (same ticker timeframe)
3. `get_live_off_exchange` (market reaction)
4. `get_historical_gov_contracts` (trend context)

##### Market Anomaly Detection
1. `get_live_off_exchange` (unusual volume)
2. `get_recent_congress_trading` (political activity)
3. `get_recent_gov_contracts_all` (sector-wide contracts)
4. `get_recent_lobbying` (influence patterns)

#### Rate Limiting and Efficiency

##### Smart Query Strategies
- Start with summary mode for exploration
- Use field selection for repeated queries
- Batch related queries together
- Cache results for iterative analysis

##### Error Handling
- API rate limits: 1000 requests/hour
- Large datasets: Use pagination instead of increasing limits
- Failed requests: Check ticker format and date ranges
- Empty results: Verify data availability for time period

#### Advanced Features

##### Prompts Available
- `analyze-congress-trading`: Structured trading pattern analysis
- `optimize-query-strategy`: Token usage optimization guidance
- `detect-anomalies`: Market surveillance workflows
- `investigate-contracts`: Government contract analysis

##### Resources Available
- Token optimization guide
- Data source documentation  
- Analysis methodology guides
- Example query patterns

#### Best Practices Summary

1. **Always start with summary mode** for initial exploration
2. **Use field selection** for repeated or focused queries
3. **Combine data sources** for comprehensive analysis
4. **Respect rate limits** with efficient query patterns
5. **Cross-reference timeframes** when connecting different datasets
6. **Document your analysis workflow** for reproducibility

Remember: This server provides powerful financial surveillance capabilities. Use responsibly and in compliance with all applicable regulations.

---

## Tools (21 Endpoints)

**Source**: `src/tools.ts`

### Common Response Options Schema

All tools support these optimization parameters:

- **mode**: `compact` | `summary` | `detailed` - Response mode for token optimization
- **format**: `json` | `table` | `csv` - Output format
- **fields**: `array` - Specific fields to include in response
- **page**: `number` - Page number for pagination (starts at 1)
- **page_size**: `number` - Number of items per page
- **limit**: `number` - Maximum number of items to return

### 1. get_companies
**Description**: Get list of companies from QuiverAPI. Returns ticker, name, exchange, market_cap by default. Use search to filter companies and fields parameter to customize output.

**Parameters**:
- `search` (optional): Search companies by name, ticker, or other attributes
- Plus all response options

**Default Fields**: `["ticker", "name", "exchange", "market_cap"]`
**Default Limit**: 100

### 2. get_funds
**Description**: Get fund information from SEC 13F data. Returns fund_name, cik, total_value, filing_date by default. Use search to filter funds.

**Parameters**:
- `search` (optional): Search funds by name, CIK, or other attributes
- Plus all response options

**Default Fields**: `["fund_name", "cik", "total_value", "filing_date"]`
**Default Limit**: 50

### 3. get_recent_congress_trading
**Description**: Get the most recent transactions by members of U.S. Congress. Returns ticker, representative, transaction_date, amount, transaction_type by default.

**Parameters**:
- `normalized` (optional): Whether to normalize the data
- Plus all response options

**Default Fields**: `["ticker", "representative", "transaction_date", "amount", "transaction_type"]`
**Default Limit**: 200

### 4. get_congress_holdings
**Description**: Get live congress holdings data. Returns ticker, representative, value, shares by default.

**Parameters**:
- All response options only

**Default Fields**: `["ticker", "representative", "value", "shares"]`
**Default Limit**: 100

### 5. get_recent_bill_summaries
**Description**: Get recent bill summaries. Supports pagination and summary length limits.

**Parameters**:
- `query` (optional): Query to match specific issue or summary
- `summary_limit` (optional): Summary length limit for bill summaries
- Plus all response options

### 6. get_historical_congress_trading
**Description**: Get all stock transactions by members of U.S. Congress for a specific ticker. Returns essential trading fields by default. Use summary mode for large datasets.

**Parameters**:
- `ticker` (required): Stock ticker symbol
- `normalized` (optional): Whether to normalize the data
- Plus all response options

**Default Fields**: `["ticker", "representative", "transaction_date", "amount", "transaction_type"]`
**Default Limit**: 200

### 7. get_ticker_data
**Description**: Get comprehensive ticker data for mobile application. Large dataset - use summary mode for overview, sections parameter for modular data, or specify fields for focused data. Available sections: basic, trading, congress, sentiment, contracts, all.

**Parameters**:
- `ticker` (required): Stock ticker symbol
- `days` (optional): Number of days of data to retrieve
- `sections` (optional): Array of sections - `["basic", "trading", "congress", "sentiment", "contracts", "all"]`
- Plus all response options

**Default Mode**: summary (due to large dataset size)

### 8. get_recent_house_trading
**Description**: Get the most recent transactions by U.S. Representatives. Returns essential trading fields by default.

**Parameters**:
- `normalized` (optional): Whether to normalize the data
- Plus all response options

**Default Fields**: `["ticker", "representative", "transaction_date", "amount", "transaction_type"]`
**Default Limit**: 200

### 9. get_recent_senate_trading
**Description**: Get the most recent transactions by U.S. Senators. Returns essential trading fields by default.

**Parameters**:
- `normalized` (optional): Whether to normalize the data
- Plus all response options

**Default Fields**: `["ticker", "representative", "transaction_date", "amount", "transaction_type"]`
**Default Limit**: 200

### 10. get_recent_gov_contracts
**Description**: Get last quarter government contract amounts for all companies. Returns essential contract information by default.

**Parameters**:
- All response options only

**Default Fields**: `["ticker", "amount", "date", "description"]`
**Default Limit**: 50

### 11. get_recent_gov_contracts_all
**Description**: Get recently announced contracts across all companies

**Parameters**:
- `page` (optional): Page number
- `page_size` (optional): Items per page
- `query` (optional): Query to filter contracts

### 12. get_recent_lobbying
**Description**: Get the most recent lobbying spending instances across all companies. Returns client_name, registrant_name, amount, date by default.

**Parameters**:
- `query` (optional): Query to filter lobbying data
- `client_name` (optional): Client name filter
- `registrant_name` (optional): Registrant name filter
- Plus all response options

**Default Fields**: `["client_name", "registrant_name", "amount", "date"]`
**Default Limit**: 50

### 13. get_recent_legislation
**Description**: Get recent legislation data

**Parameters**:
- None (basic endpoint)

### 14. get_live_off_exchange
**Description**: Get yesterdays off-exchange activity across all companies

**Parameters**:
- `page` (optional): Page number
- `page_size` (optional): Items per page

### 15. get_historical_gov_contracts
**Description**: Get historical quarterly government contracts amounts for a ticker

**Parameters**:
- `ticker` (required): Stock ticker symbol

### 16. get_historical_gov_contracts_all
**Description**: Get historical government contracts for a ticker

**Parameters**:
- `ticker` (required): Stock ticker symbol

### 17. get_historical_house_trading
**Description**: Get all stock transactions by U.S. Representatives for a ticker

**Parameters**:
- `ticker` (required): Stock ticker symbol

### 18. get_historical_senate_trading
**Description**: Get all stock transactions by U.S. Senators for a ticker

**Parameters**:
- `ticker` (required): Stock ticker symbol

### 19. get_historical_lobbying
**Description**: Get all lobbying spending instances for a ticker

**Parameters**:
- `ticker` (required): Stock ticker symbol
- `page` (optional): Page number
- `page_size` (optional): Items per page
- `query` (optional): Query to filter lobbying data
- `client_name` (optional): Client name filter

### 20. get_historical_off_exchange
**Description**: Get daily historical off-exchange activity for a ticker

**Parameters**:
- `ticker` (required): Stock ticker symbol

### 21. get_bulk_congress_trading
**Description**: Get the full history of transactions by members of U.S. Congress. LARGE DATASET - strongly recommend using summary mode and filters to reduce response size.

**Parameters**:
- `ticker` (optional): Filter by ticker symbol
- `representative` (optional): Filter by representative name
- `transaction_date_gte` (optional): Filter by transaction date (greater than or equal)
- `transaction_date_lte` (optional): Filter by transaction date (less than or equal)
- `amount_gte` (optional): Filter by amount (greater than or equal)
- `amount_lte` (optional): Filter by amount (less than or equal)
- `transaction_type` (optional): Filter by transaction type
- Plus all response options

**Default Mode**: summary (due to very large dataset)
**Default Limit**: 1000

---

## Resources (6 Guides)

**Source**: `src/resources.ts`

### 1. Token Optimization Guide

#### Overview
This guide helps you minimize token usage while maximizing data value from QuiverAPI endpoints.

#### Quick Optimization Checklist

##### 1. Choose the Right Response Mode
- **summary**: Best for large datasets, provides overview + sample data (60-80% token reduction)
- **compact**: JSON string format, most token-efficient for programmatic use
- **detailed**: Full data, use only when complete information is required

##### 2. Use Field Selection
```javascript
// Instead of getting all fields:
get_companies()

// Get only what you need:
get_companies({
  fields: ["ticker", "name", "market_cap"],
  limit: 50
})
```

##### 3. Apply Smart Limits
- **Exploration**: limit: 25-50
- **Analysis**: limit: 100-200  
- **Bulk Processing**: Use pagination with page_size: 50

##### 4. Use Format Options
- **table**: Great for numerical data, easier to read
- **csv**: Most compact for large datasets
- **json**: Default, most flexible

#### Endpoint-Specific Tips

##### Large Datasets (Congress Trading, Bulk Data)
```javascript
{
  mode: "summary",
  limit: 100,
  fields: ["ticker", "representative", "amount", "transaction_type"],
  format: "table"
}
```

##### Company Data
```javascript
get_ticker_data({
  ticker: "AAPL",
  sections: ["basic", "trading"], // Instead of all sections
  mode: "summary"
})
```

##### Government Data
```javascript
get_recent_lobbying({
  mode: "detailed",
  fields: ["client_name", "amount", "date"],
  page_size: 30,
  query: "defense" // Filter by topic
})
```

#### Token Savings Examples

##### Before Optimization
```javascript
get_recent_congress_trading() // ~8000 tokens
```

##### After Optimization  
```javascript
get_recent_congress_trading({
  mode: "summary",
  limit: 50,
  fields: ["ticker", "representative", "amount"],
  format: "table"
}) // ~1200 tokens (85% reduction)
```

#### Progressive Analysis Strategy

1. **Start Small**: Use summary mode with low limits
2. **Identify Patterns**: Look for interesting data points
3. **Drill Down**: Use detailed mode on specific subsets
4. **Optimize Continuously**: Adjust fields and limits based on findings

#### Common Pitfalls

❌ **Don't**: Use detailed mode for initial exploration  
✅ **Do**: Start with summary mode

❌ **Don't**: Request all fields when you need specific data  
✅ **Do**: Use targeted field selection

❌ **Don't**: Process entire datasets at once  
✅ **Do**: Use pagination for large datasets

#### Token Budget Guidelines

- **Quick Check**: 500-1000 tokens (summary mode, small limits)
- **Analysis**: 2000-5000 tokens (targeted detailed queries)  
- **Deep Dive**: 5000-10000 tokens (comprehensive analysis)

### 2. Field Reference Guide

#### Default Field Sets

##### Companies (`get_companies`)
**Default**: `["ticker", "name", "exchange", "market_cap"]`
**Available**: ticker, name, exchange, market_cap, sector, industry, employees, founded

##### Funds (`get_funds`)  
**Default**: `["fund_name", "cik", "total_value", "filing_date"]`
**Available**: fund_name, cik, total_value, filing_date, holdings_count, manager

##### Congress Trading
**Default**: `["ticker", "representative", "transaction_date", "amount", "transaction_type"]`
**Available**: ticker, representative, transaction_date, amount, transaction_type, disclosure_date, chamber, party, state

##### Congress Holdings
**Default**: `["ticker", "representative", "value", "shares"]`  
**Available**: ticker, representative, value, shares, filing_date, chamber, party

##### Lobbying
**Default**: `["client_name", "registrant_name", "amount", "date"]`
**Available**: client_name, registrant_name, amount, date, issue, specific_issue, lobbyists

##### Government Contracts
**Default**: `["ticker", "amount", "date", "description"]`
**Available**: ticker, amount, date, description, agency, contract_type, award_type

#### Ticker Data Sections

##### Basic Section
`["ticker", "name", "price", "change", "volume", "market_cap"]`

##### Trading Section  
`["price", "change", "volume", "high", "low", "open", "close", "vwap"]`

##### Congress Section
`["congress_trading", "recent_congress_trades", "congress_sentiment", "congress_buys", "congress_sells"]`

##### Sentiment Section
`["wsb_sentiment", "social_sentiment", "options_flow", "reddit_posts", "twitter_sentiment"]`

##### Contracts Section
`["gov_contracts", "lobbying_spending", "contract_awards", "lobbying_clients"]`

#### Field Selection Examples

##### Minimal Trading Analysis
```javascript
fields: ["ticker", "amount", "transaction_type"]
```

##### Timing Analysis
```javascript
fields: ["ticker", "transaction_date", "disclosure_date", "amount"]
```

##### Representative Analysis  
```javascript
fields: ["representative", "chamber", "party", "amount", "transaction_type"]
```

##### Financial Focus
```javascript
fields: ["ticker", "amount", "value", "shares"]
```

#### Tips

- Use specific fields to reduce token usage by 40-70%
- Combine with limits for maximum efficiency
- Start with default fields, then customize based on analysis needs
- Consider your analysis goal when selecting fields

### 3. Congressional Trading Analysis Examples

#### Example 1: Recent Activity Overview

##### Goal: Get a quick overview of recent congressional trading

```javascript
get_recent_congress_trading({
  mode: "summary",
  limit: 50,
  fields: ["ticker", "representative", "amount", "transaction_type"],
  format: "table"
})
```

**Expected Output**: Clean table showing recent trades with ~1200 tokens

#### Example 2: Specific Representative Analysis

##### Goal: Analyze trading patterns for a specific representative

```javascript
get_bulk_congress_trading({
  representative: "Nancy Pelosi",
  mode: "detailed",
  fields: ["ticker", "transaction_date", "amount", "transaction_type"],
  limit: 100,
  transaction_date_gte: "2024-01-01"
})
```

#### Example 3: Stock-Specific Congressional Interest

##### Goal: See all congressional activity for NVIDIA

```javascript
get_historical_congress_trading({
  ticker: "NVDA",
  mode: "detailed",
  fields: ["representative", "transaction_date", "amount", "transaction_type", "party"],
  format: "table"
})
```

#### Example 4: Large-Scale Pattern Analysis

##### Goal: Find unusual trading patterns in tech stocks

```javascript
// Step 1: Get overview
get_bulk_congress_trading({
  mode: "summary",
  limit: 200,
  transaction_date_gte: "2024-01-01",
  amount_gte: 15000
})

// Step 2: Drill down on interesting findings
get_bulk_congress_trading({
  ticker: "IDENTIFIED_TICKER",
  mode: "detailed",
  fields: ["representative", "transaction_date", "amount", "disclosure_date"]
})
```

#### Example 5: Party-Based Analysis

##### Goal: Compare trading patterns between parties

```javascript
// Get recent trades with party information
get_recent_congress_trading({
  mode: "detailed", 
  fields: ["ticker", "representative", "party", "amount", "transaction_type"],
  limit: 150,
  format: "csv" // Easy to analyze in spreadsheet
})
```

#### Example 6: Timing Analysis

##### Goal: Look for trades around earnings announcements

```javascript
get_bulk_congress_trading({
  ticker: "AAPL",
  transaction_date_gte: "2024-01-01",
  transaction_date_lte: "2024-01-31", // Earnings month
  mode: "detailed",
  fields: ["representative", "transaction_date", "disclosure_date", "amount", "transaction_type"]
})
```

#### Progressive Analysis Workflow

##### Phase 1: Exploration (Budget: ~1000 tokens)
1. Use summary mode with limit: 50
2. Identify interesting patterns or representatives
3. Note unusual tickers or amounts

##### Phase 2: Investigation (Budget: ~3000 tokens)  
1. Use detailed mode on specific subsets
2. Apply targeted filters (ticker, representative, dates)
3. Use table format for easier pattern recognition

##### Phase 3: Deep Dive (Budget: ~5000 tokens)
1. Full detailed analysis on identified opportunities
2. Cross-reference with market events
3. Generate comprehensive reports

#### Token Optimization Tips

- Start with summary mode (saves 60-80% tokens)
- Use specific date ranges to limit data
- Apply amount thresholds to filter noise
- Use representative or ticker filters for focused analysis
- Consider csv format for large numerical datasets

#### Common Analysis Questions

**Q: Who are the most active traders?**
```javascript
get_recent_congress_trading({
  mode: "detailed",
  fields: ["representative", "amount"],
  limit: 200,
  format: "csv"
})
```

**Q: What stocks are congressional favorites?**
```javascript  
get_recent_congress_trading({
  mode: "summary", 
  fields: ["ticker", "amount", "transaction_type"],
  limit: 300
})
```

**Q: Are there timing patterns around disclosure?**
```javascript
get_bulk_congress_trading({
  mode: "detailed",
  fields: ["transaction_date", "disclosure_date", "amount"],
  limit: 150,
  transaction_date_gte: "2024-01-01"
})
```

### 4. Company Research Examples

#### Example 1: Quick Company Overview

##### Goal: Get essential information about a company

```javascript
get_ticker_data({
  ticker: "TSLA",
  sections: ["basic", "trading"],
  mode: "summary"
})
```

**Result**: Company fundamentals + recent trading data (~800 tokens)

#### Example 2: Government Relationship Analysis

##### Goal: Understand a company's government connections

```javascript
// Step 1: Congressional trading activity
get_historical_congress_trading({
  ticker: "LMT",
  mode: "detailed",
  fields: ["representative", "transaction_date", "amount", "transaction_type"],
  limit: 50
})

// Step 2: Government contracts
get_historical_gov_contracts({
  ticker: "LMT",
  mode: "summary"
})

// Step 3: Lobbying spending
get_historical_lobbying({
  ticker: "LMT", 
  mode: "summary",
  page_size: 20
})
```

#### Example 3: Comprehensive Tech Company Analysis

##### Goal: Full analysis of a major tech company

```javascript
// Phase 1: Company fundamentals
get_ticker_data({
  ticker: "GOOGL",
  sections: ["basic"],
  mode: "detailed"
})

// Phase 2: Congressional interest
get_historical_congress_trading({
  ticker: "GOOGL",
  mode: "summary", // Large dataset
  fields: ["representative", "amount", "transaction_type"]
})

// Phase 3: Government relations
get_historical_lobbying({
  ticker: "GOOGL",
  mode: "detailed",
  fields: ["amount", "date", "issue"],
  page_size: 15
})

// Phase 4: Market sentiment (if needed)
get_ticker_data({
  ticker: "GOOGL", 
  sections: ["sentiment"],
  mode: "summary"
})
```

#### Example 4: Defense Contractor Deep Dive

##### Goal: Analyze defense industry relationships

```javascript
// Government contracts focus
get_historical_gov_contracts_all({
  ticker: "RTX",
  mode: "detailed"
})

// Congressional trading patterns  
get_historical_congress_trading({
  ticker: "RTX",
  mode: "detailed",
  fields: ["representative", "transaction_date", "amount", "party"]
})

// Lobbying expenditures
get_historical_lobbying({
  ticker: "RTX",
  mode: "detailed", 
  fields: ["amount", "date", "issue", "client_name"],
  page_size: 25
})
```

#### Example 5: Comparative Analysis

##### Goal: Compare multiple companies in same sector

```javascript
const tickers = ["AAPL", "MSFT", "GOOGL"];

// For each ticker:
tickers.forEach(ticker => {
  // Basic info
  get_ticker_data({
    ticker,
    sections: ["basic", "trading"],
    mode: "summary"
  });
  
  // Congressional activity
  get_historical_congress_trading({
    ticker,
    mode: "summary",
    fields: ["amount", "transaction_type"],
    limit: 30
  });
});
```

#### Example 6: Event-Driven Analysis

##### Goal: Analyze company around specific events

```javascript
// Congressional trading around earnings
get_bulk_congress_trading({
  ticker: "META",
  transaction_date_gte: "2024-01-20", // Week before earnings
  transaction_date_lte: "2024-02-05", // Week after earnings  
  mode: "detailed",
  fields: ["representative", "transaction_date", "amount", "transaction_type"]
})

// Any government activity in same period
get_recent_gov_contracts_all({
  query: "Meta OR Facebook",
  page_size: 10,
  mode: "detailed"
})
```

#### Research Workflow Templates

##### Template 1: New Company Investigation
1. **Basic Info**: ticker_data with basic sections
2. **Congressional Interest**: historical_congress_trading (summary)
3. **Government Ties**: gov_contracts + lobbying (summary)
4. **Deep Dive**: Detailed analysis on interesting findings

##### Template 2: Sector Analysis
1. **Company List**: get_companies with sector filter
2. **Batch Overview**: Basic data for all companies
3. **Congressional Favorites**: Identify most-traded companies
4. **Comparative Analysis**: Detail on top companies

##### Template 3: Investigation Mode  
1. **Hypothesis Formation**: Summary data to identify patterns
2. **Evidence Gathering**: Detailed queries on specific findings
3. **Cross-Verification**: Multiple data sources for confirmation
4. **Timeline Analysis**: Date-ordered sequence of events

#### Token Budget Planning

##### Quick Research (1000-2000 tokens)
- Basic company info
- Congressional trading summary
- Government contracts overview

##### Standard Analysis (3000-5000 tokens)
- Detailed trading patterns
- Lobbying analysis  
- Multi-source cross-reference

##### Comprehensive Report (8000-12000 tokens)
- Full company profile
- Historical trend analysis
- Competitive comparison
- Event correlation analysis

#### Optimization Strategies

1. **Modular Approach**: Use sections parameter for ticker_data
2. **Progressive Detail**: Start summary, drill down to detailed
3. **Smart Filtering**: Use date ranges and amount thresholds
4. **Format Selection**: Table for numbers, JSON for complex data
5. **Batch Processing**: Combine related queries efficiently

### 5. Response Modes Reference

#### Overview
QuiverMCP offers three response modes to optimize token usage based on your analysis needs.

#### Mode Comparison

| Mode | Token Usage | Best For | Data Completeness |
|------|-------------|----------|-------------------|
| summary | 20-40% of detailed | Exploration, Overview | Sample + Statistics |
| compact | 10-20% of detailed | Programmatic Use | Full (compressed) |
| detailed | 100% | Final Analysis | Complete |

#### Detailed Mode
**Usage**: `mode: "detailed"`  
**Purpose**: Complete data access
**Token Impact**: Baseline (100%)

##### When to Use
- Final analysis phase
- Need complete data integrity  
- Working with small datasets (<50 records)
- Require all available fields

##### Example Output
```json
{
  "data": [
    {
      "ticker": "AAPL",
      "representative": "Nancy Pelosi", 
      "transaction_date": "2024-01-15",
      "amount": "$1,000,001 - $5,000,000",
      "transaction_type": "Purchase",
      "disclosure_date": "2024-01-30",
      "chamber": "House",
      "party": "Democratic",
      "state": "CA"
      // ... all available fields
    }
    // ... all records
  ],
  "summary": {
    "total_items": 1247,
    "fields_included": ["all"]
  }
}
```

#### Summary Mode  
**Usage**: `mode: "summary"`
**Purpose**: Quick insights with sample data
**Token Impact**: 60-80% reduction

##### When to Use
- Initial data exploration
- Large datasets (>100 records)
- Pattern identification
- Budget-conscious analysis

##### Example Output
```json
{
  "data": {
    "type": "array",
    "count": 1247,
    "sample": [
      {
        "ticker": "AAPL",
        "representative": "Nancy Pelosi",
        "amount": "$1,000,001 - $5,000,000"
      },
      {
        "ticker": "TSLA", 
        "representative": "Josh Gottheimer",
        "amount": "$15,001 - $50,000"
      },
      {
        "ticker": "NVDA",
        "representative": "Dan Crenshaw", 
        "amount": "$1,001 - $15,000"
      }
    ],
    "fields": ["ticker", "representative", "transaction_date", "amount", "transaction_type"]
  },
  "summary": {
    "total_items": 1247,
    "mode": "summary"
  }
}
```

#### Compact Mode
**Usage**: `mode: "compact"`
**Purpose**: Maximum token efficiency  
**Token Impact**: 80-90% reduction

##### When to Use
- Programmatic processing
- Data transfer to other systems
- Maximum token conservation
- API integrations

##### Example Output
```json
{
  "data": "[{\"ticker\":\"AAPL\",\"representative\":\"Nancy Pelosi\",\"amount\":\"$1,000,001 - $5,000,000\"},{\"ticker\":\"TSLA\",\"representative\":\"Josh Gottheimer\",\"amount\":\"$15,001 - $50,000\"}]",
  "summary": {
    "total_items": 1247,
    "mode": "compact"
  }
}
```

#### Mode Selection Strategy

##### Progressive Analysis Workflow
1. **Start**: summary mode for exploration
2. **Identify**: Interesting patterns or outliers  
3. **Focus**: detailed mode on specific subsets
4. **Process**: compact mode for final data transfer

##### Decision Tree
- Need complete data? → Use detailed mode
- Large dataset (>100 records)? → Use summary mode  
- Programmatic processing? → Use compact mode
- Otherwise → Use detailed mode

#### Combining with Other Optimizations

##### Summary + Field Selection
```javascript
{
  mode: "summary",
  fields: ["ticker", "amount", "transaction_type"],
  limit: 50
}
// Result: ~400 tokens vs ~3000 tokens (87% reduction)
```

##### Summary + Format Options
```javascript
{
  mode: "summary", 
  format: "table",
  limit: 25
}
// Result: Clean table format with minimal tokens
```

##### Detailed + Smart Limits
```javascript
{
  mode: "detailed",
  limit: 20,
  fields: ["ticker", "representative", "amount"]
}
// Result: Complete data for focused analysis
```

#### Performance Guidelines

##### Token Budget Allocation
- **Exploration (20%)**: summary mode, broad queries
- **Investigation (60%)**: detailed mode, targeted queries  
- **Processing (20%)**: compact mode, data extraction

##### Best Practices
1. Always start with summary mode for unknown datasets
2. Use detailed mode only after identifying specific needs
3. Combine with field selection for maximum efficiency  
4. Use compact mode for final data processing
5. Consider pagination for very large datasets

#### Common Pitfalls

❌ **Using detailed mode for exploration**
- Wastes tokens on potentially irrelevant data

❌ **Using compact mode for human analysis**  
- JSON strings are hard to read and analyze

❌ **Not combining modes with other optimizations**
- Missing opportunity for compound token savings

✅ **Progressive refinement approach**
- Start broad, narrow down systematically

✅ **Match mode to use case**
- Summary for exploration, detailed for analysis, compact for processing

### 6. Server Usage Instructions

This comprehensive guide is embedded as the first resource (`quiver://server/instructions`) and contains the core workflow patterns, optimization strategies, and best practices outlined in the Server Instructions section above.

---

## Prompts (4 Workflows)

**Source**: `src/prompts.ts`

### 1. analyze-congress-trading

**Description**: Guide analysis of congressional trading patterns for a specific ticker or representative

**Arguments**:
- `ticker` (optional): Stock ticker symbol to analyze
- `representative` (optional): Representative name to analyze
- `timeframe` (optional): Analysis timeframe (recent, historical, or both)

**Prompt Template**:
```
I want to analyze congressional trading patterns[for {ticker}][by {representative}]. Please help me conduct a comprehensive analysis using {timeframe} data.

I'll help you analyze congressional trading patterns. Here's a structured approach:

**Step 1: Get Recent Activity**
Use `get_recent_congress_trading` with these optimization parameters:
- mode: "summary" (for overview) or "detailed" (for full analysis)  
- fields: ["ticker", "representative", "transaction_date", "amount", "transaction_type"]
- limit: 50-100 (to start with manageable data)

**Step 2: Historical Context** 
Use `get_historical_congress_trading` with ticker="{ticker}" or `get_bulk_congress_trading` with appropriate filters
- mode: "summary" (to avoid large responses)
- Add date filters if needed: transaction_date_gte/lte

**Step 3: Analysis Focus Areas**
- Transaction patterns and timing
- Buy vs sell ratios  
- Transaction amounts and frequency
- Correlation with market events

**Step 4: Optimize Your Queries**
- Use "summary" mode for large datasets
- Apply date ranges to limit data
- Use pagination for large results
- Select specific fields to reduce token usage

Would you like me to start with recent trading activity, or do you have a specific aspect you'd like to focus on first?
```

### 2. company-deep-dive

**Description**: Comprehensive analysis workflow for a specific company

**Arguments**:
- `ticker` (required): Stock ticker symbol to analyze
- `focus_areas` (optional): Specific areas to focus on: trading, government, lobbying, sentiment

**Prompt Template**:
```
I want to conduct a comprehensive analysis of {ticker}. Please guide me through a deep dive focusing on {focus_areas}.

I'll guide you through a comprehensive analysis of {ticker}. Here's the optimal approach:

**Step 1: Company Overview**
Use `get_ticker_data` with:
- ticker: "{ticker}"  
- sections: ["basic", "trading"] (start with essentials)
- mode: "summary" (for initial overview)

**Step 2: Congressional Activity**
`get_historical_congress_trading` with:
- ticker: "{ticker}"
- mode: "detailed"
- fields: ["representative", "transaction_date", "amount", "transaction_type"]

**Step 3: Government Relationships**
`get_historical_gov_contracts` and `get_historical_lobbying` with:
- ticker: "{ticker}"
- mode: "summary" (contracts can be large datasets)
- Use pagination if needed

**Step 4: Market Sentiment** (if available)
Use `get_ticker_data` with:
- sections: ["sentiment"] 
- This includes social sentiment and options flow

**Step 5: Analysis Synthesis**
- Compare congressional trading with stock performance
- Identify government contract patterns
- Analyze lobbying spending correlation
- Look for timing patterns around major events

**Token Optimization Tips:**
- Start with "summary" mode to understand data size
- Use sections parameter for ticker_data to get only needed info
- Apply date filters to limit historical data
- Use "table" format for easier reading of numerical data

Which area would you like to start with, or shall I begin with the company overview?
```

### 3. government-influence-analysis

**Description**: Analyze government influence on markets through contracts and lobbying

**Arguments**:
- `sector` (optional): Industry sector to focus on
- `timeframe` (optional): Time period for analysis

**Prompt Template**:
```
I want to analyze government influence on markets [in the {sector} sector] using {timeframe}.

I'll help you analyze government influence on markets. Here's a systematic approach:

**Step 1: Government Contracts Analysis**
Use `get_recent_gov_contracts_all` with:
- mode: "summary" (large dataset)
- page_size: 50 (manageable chunks)
- query: "{sector}" (to filter by sector, if specified)
- format: "table" (easier to read financial data)

**Step 2: Lobbying Activity**
Use `get_recent_lobbying` with:
- mode: "detailed"
- fields: ["client_name", "registrant_name", "amount", "date"]
- query: "{sector}" (if specified)
- page_size: 30

**Step 3: Congressional Trading Patterns**
Use `get_recent_congress_trading` with:
- mode: "detailed"
- fields: ["ticker", "representative", "amount", "transaction_type"]
- limit: 100

**Step 4: Cross-Reference Analysis**
- Identify companies receiving major contracts
- Look for congressional trading around contract announcements
- Analyze lobbying spending vs contract awards
- Track timing patterns

**Step 5: Sector-Specific Insights** ({sector} focus, if specified)
- Compare contract amounts across companies
- Identify key lobbying themes
- Track representative trading patterns in sector stocks

**Token Efficiency Tips:**
- Use "summary" mode for initial data exploration
- Apply query filters to focus on relevant data
- Use pagination to process large datasets in chunks
- Consider "csv" format for numerical analysis

Would you like to start with government contracts, or do you have a specific angle you'd like to explore first?
```

### 4. optimize-query-strategy

**Description**: Guide users on optimizing their data queries to reduce token usage

**Arguments**:
- `data_type` (required): Type of data being queried (congress, lobbying, contracts, etc.)
- `analysis_goal` (optional): What the user wants to accomplish with the data

**Prompt Template**:
```
I want to optimize my queries for {data_type} data. My goal is {analysis_goal}. How can I reduce token usage while getting the data I need?

Great question! Here are optimization strategies for {data_type} data:

**Response Mode Optimization:**
- `mode: "summary"` - Best for large datasets, provides overview with sample data
- `mode: "compact"` - Returns JSON string, most token-efficient for processing
- `mode: "detailed"` - Full data, use only when you need complete information

**Field Selection:**
- `fields: []` - Specify only the columns you need
- Default fields for {data_type}: [specific defaults based on data type]
- Avoid `fields: ["all"]` unless absolutely necessary

**Pagination & Limits:**
- `limit: N` - Cap total results (e.g., limit: 50 for initial exploration)
- `page_size: N` - Control chunk size (20-50 recommended)
- `page: N` - Process data in batches

**Format Options:**
- `format: "table"` - Great for numerical data, easier to read
- `format: "csv"` - Most compact for large datasets
- `format: "json"` - Default, most flexible

**Data Type Specific Tips:**
[Customized tips based on data_type - congress, lobbying, contracts, ticker_data, etc.]

**Recommended Starting Query:**
{
  // your specific parameters
  mode: "summary",
  limit: 25,
  fields: [default fields for data type]
}

**Analysis Goal Optimization for "{analysis_goal}":**
[Customized advice based on analysis goal - overview, trends, specific analysis, etc.]

Would you like me to help you craft an optimized query for your specific use case?
```

---

## Response Optimization System

**Source**: `src/response-utils.ts`

### Response Modes
- **compact**: JSON string format (10-20% of detailed token usage)
- **summary**: Overview with sample data (20-40% of detailed token usage)  
- **detailed**: Complete data (100% baseline)

### Output Formats
- **json**: Default format, most flexible
- **table**: Markdown table format, great for numerical data
- **csv**: Comma-separated values, most compact for large datasets

### Field Selection
Granular control over which data fields are returned:
```javascript
// Example field selection
{
  fields: ["ticker", "amount", "transaction_date"],
  explicitFields: true // Only apply if fields explicitly specified
}
```

### Pagination
Built-in pagination support:
```javascript
{
  page: 1,           // Page number (starts at 1)
  page_size: 50,     // Items per page
  limit: 200         // Maximum total items
}
```

### Default Limits by Endpoint
- **companies**: 100
- **funds**: 50
- **congress_trading**: 200
- **congress_holdings**: 100
- **lobbying**: 50
- **gov_contracts**: 50
- **bulk_data**: 1000
- **ticker_data**: 1 (per-ticker endpoint)

### Ticker Data Sections
Modular data access for `get_ticker_data`:
- **basic**: Company info and current price
- **trading**: Price, volume, OHLC data
- **congress**: Congressional trading activity
- **sentiment**: Social sentiment and options flow
- **contracts**: Government contracts and lobbying
- **all**: Everything (use with caution)

---

## API Endpoint Definitions

**Source**: `src/tier1-endpoints.json`

The server implements 21 tools based on QuiverAPI's Tier 1 endpoints. Key endpoints include:

### Core Endpoints
1. **Companies** (`/beta/companies`) - List of companies
2. **Funds** (`/beta/funds`) - SEC 13F fund information
3. **Congressional Trading** (`/beta/live/congresstrading`) - Recent congress trades
4. **Congress Holdings** (`/beta/live/congressholdings`) - Current holdings
5. **Ticker Data** (`/beta/mobile/ticker/{ticker}`) - Comprehensive ticker data

### Congressional Data
6. **House Trading** (`/beta/live/housetrading`) - Representatives only
7. **Senate Trading** (`/beta/live/senatetrading`) - Senators only
8. **Historical Congress** (`/beta/historical/congresstrading/{ticker}`) - By ticker
9. **Historical House** (`/beta/historical/housetrading/{ticker}`) - House by ticker
10. **Historical Senate** (`/beta/historical/senatetrading/{ticker}`) - Senate by ticker
11. **Bulk Congress** (`/beta/bulk/congresstrading`) - Complete history

### Government Activity
12. **Recent Gov Contracts** (`/beta/live/govcontracts`) - Quarterly contracts
13. **Gov Contracts All** (`/beta/live/govcontractsall`) - All recent contracts
14. **Historical Contracts** (`/beta/historical/govcontracts/{ticker}`) - By ticker
15. **Historical Contracts All** (`/beta/historical/govcontractsall/{ticker}`) - All by ticker

### Lobbying & Legislation
16. **Recent Lobbying** (`/beta/live/lobbying`) - Recent lobbying spending
17. **Historical Lobbying** (`/beta/historical/lobbying/{ticker}`) - By ticker
18. **Recent Legislation** (`/beta/live/legislation`) - Recent legislation data
19. **Bill Summaries** (`/beta/live/bill_summaries`) - Recent bill summaries

### Market Data
20. **Live Off-Exchange** (`/beta/live/offexchange`) - Yesterday's dark pool activity
21. **Historical Off-Exchange** (`/beta/historical/offexchange/{ticker}`) - Historical by ticker

### Authentication
All endpoints require Bearer token authentication via the `QUIVER_API_TOKEN` environment variable.

### Rate Limits
- Standard rate limit: 1000 requests/hour
- Large datasets should use pagination rather than increased limits
- Summary mode recommended for initial exploration of large datasets

---

This reference document consolidates all LLM-facing content from the QuiverMCP server, providing comprehensive guidance for effective usage, optimization, and analysis workflows.