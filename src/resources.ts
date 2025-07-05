import { SERVER_INSTRUCTIONS } from './server-instructions.js';

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

export const quiverResources: MCPResource[] = [
  {
    uri: 'quiver://server/instructions',
    name: 'Server Usage Instructions',
    description: 'Comprehensive guide for using the Quiver Financial Data Server effectively',
    mimeType: 'text/markdown'
  },
  {
    uri: 'quiver://docs/optimization-guide',
    name: 'Token Optimization Guide',
    description: 'Best practices for reducing token usage while maintaining data quality',
    mimeType: 'text/markdown'
  },
  {
    uri: 'quiver://docs/field-reference',
    name: 'Field Reference Guide',
    description: 'Complete reference of available fields for each endpoint',
    mimeType: 'text/markdown'
  },
  {
    uri: 'quiver://examples/congress-analysis',
    name: 'Congressional Trading Analysis Examples',
    description: 'Example queries and workflows for analyzing congressional trading',
    mimeType: 'text/markdown'
  },
  {
    uri: 'quiver://examples/company-research',
    name: 'Company Research Examples',
    description: 'Step-by-step examples for comprehensive company analysis',
    mimeType: 'text/markdown'
  },
  {
    uri: 'quiver://reference/response-modes',
    name: 'Response Modes Reference',
    description: 'Detailed explanation of summary, compact, and detailed response modes',
    mimeType: 'text/markdown'
  }
];

export function getResource(uri: string): { contents: string; mimeType: string } {
  switch (uri) {
    case 'quiver://server/instructions':
      return {
        contents: SERVER_INSTRUCTIONS,
        mimeType: 'text/markdown'
      };
    case 'quiver://docs/optimization-guide':
      return {
        contents: getOptimizationGuide(),
        mimeType: 'text/markdown'
      };
    case 'quiver://docs/field-reference':
      return {
        contents: getFieldReference(),
        mimeType: 'text/markdown'
      };
    case 'quiver://examples/congress-analysis':
      return {
        contents: getCongressAnalysisExamples(),
        mimeType: 'text/markdown'
      };
    case 'quiver://examples/company-research':
      return {
        contents: getCompanyResearchExamples(),
        mimeType: 'text/markdown'
      };
    case 'quiver://reference/response-modes':
      return {
        contents: getResponseModesReference(),
        mimeType: 'text/markdown'
      };
    default:
      throw new Error(`Unknown resource: ${uri}`);
  }
}

function getOptimizationGuide(): string {
  return `# QuiverMCP Token Optimization Guide

## Overview
This guide helps you minimize token usage while maximizing data value from QuiverAPI endpoints.

## Quick Optimization Checklist

### 1. Choose the Right Response Mode
- **summary**: Best for large datasets, provides overview + sample data (60-80% token reduction)
- **compact**: JSON string format, most token-efficient for programmatic use
- **detailed**: Full data, use only when complete information is required

### 2. Use Field Selection
\`\`\`javascript
// Instead of getting all fields:
get_companies()

// Get only what you need:
get_companies({
  fields: ["ticker", "name", "market_cap"],
  limit: 50
})
\`\`\`

### 3. Apply Smart Limits
- **Exploration**: limit: 25-50
- **Analysis**: limit: 100-200  
- **Bulk Processing**: Use pagination with page_size: 50

### 4. Use Format Options
- **table**: Great for numerical data, easier to read
- **csv**: Most compact for large datasets
- **json**: Default, most flexible

## Endpoint-Specific Tips

### Large Datasets (Congress Trading, Bulk Data)
\`\`\`javascript
{
  mode: "summary",
  limit: 100,
  fields: ["ticker", "representative", "amount", "transaction_type"],
  format: "table"
}
\`\`\`

### Company Data
\`\`\`javascript
get_ticker_data({
  ticker: "AAPL",
  sections: ["basic", "trading"], // Instead of all sections
  mode: "summary"
})
\`\`\`

### Government Data
\`\`\`javascript
get_recent_lobbying({
  mode: "detailed",
  fields: ["client_name", "amount", "date"],
  page_size: 30,
  query: "defense" // Filter by topic
})
\`\`\`

## Token Savings Examples

### Before Optimization
\`\`\`javascript
get_recent_congress_trading() // ~8000 tokens
\`\`\`

### After Optimization  
\`\`\`javascript
get_recent_congress_trading({
  mode: "summary",
  limit: 50,
  fields: ["ticker", "representative", "amount"],
  format: "table"
}) // ~1200 tokens (85% reduction)
\`\`\`

## Progressive Analysis Strategy

1. **Start Small**: Use summary mode with low limits
2. **Identify Patterns**: Look for interesting data points
3. **Drill Down**: Use detailed mode on specific subsets
4. **Optimize Continuously**: Adjust fields and limits based on findings

## Common Pitfalls

❌ **Don't**: Use detailed mode for initial exploration  
✅ **Do**: Start with summary mode

❌ **Don't**: Request all fields when you need specific data  
✅ **Do**: Use targeted field selection

❌ **Don't**: Process entire datasets at once  
✅ **Do**: Use pagination for large datasets

## Token Budget Guidelines

- **Quick Check**: 500-1000 tokens (summary mode, small limits)
- **Analysis**: 2000-5000 tokens (targeted detailed queries)  
- **Deep Dive**: 5000-10000 tokens (comprehensive analysis)
`;
}

function getFieldReference(): string {
  return `# QuiverMCP Field Reference

## Default Field Sets

### Companies (\`get_companies\`)
**Default**: \`["ticker", "name", "exchange", "market_cap"]\`
**Available**: ticker, name, exchange, market_cap, sector, industry, employees, founded

### Funds (\`get_funds\`)  
**Default**: \`["fund_name", "cik", "total_value", "filing_date"]\`
**Available**: fund_name, cik, total_value, filing_date, holdings_count, manager

### Congress Trading
**Default**: \`["ticker", "representative", "transaction_date", "amount", "transaction_type"]\`
**Available**: ticker, representative, transaction_date, amount, transaction_type, disclosure_date, chamber, party, state

### Congress Holdings
**Default**: \`["ticker", "representative", "value", "shares"]\`  
**Available**: ticker, representative, value, shares, filing_date, chamber, party

### Lobbying
**Default**: \`["client_name", "registrant_name", "amount", "date"]\`
**Available**: client_name, registrant_name, amount, date, issue, specific_issue, lobbyists

### Government Contracts
**Default**: \`["ticker", "amount", "date", "description"]\`
**Available**: ticker, amount, date, description, agency, contract_type, award_type

## Ticker Data Sections

### Basic Section
\`["ticker", "name", "price", "change", "volume", "market_cap"]\`

### Trading Section  
\`["price", "change", "volume", "high", "low", "open", "close", "vwap"]\`

### Congress Section
\`["congress_trading", "recent_congress_trades", "congress_sentiment", "congress_buys", "congress_sells"]\`

### Sentiment Section
\`["wsb_sentiment", "social_sentiment", "options_flow", "reddit_posts", "twitter_sentiment"]\`

### Contracts Section
\`["gov_contracts", "lobbying_spending", "contract_awards", "lobbying_clients"]\`

## Field Selection Examples

### Minimal Trading Analysis
\`\`\`javascript
fields: ["ticker", "amount", "transaction_type"]
\`\`\`

### Timing Analysis
\`\`\`javascript
fields: ["ticker", "transaction_date", "disclosure_date", "amount"]
\`\`\`

### Representative Analysis  
\`\`\`javascript
fields: ["representative", "chamber", "party", "amount", "transaction_type"]
\`\`\`

### Financial Focus
\`\`\`javascript
fields: ["ticker", "amount", "value", "shares"]
\`\`\`

## Tips

- Use specific fields to reduce token usage by 40-70%
- Combine with limits for maximum efficiency
- Start with default fields, then customize based on analysis needs
- Consider your analysis goal when selecting fields
`;
}

function getCongressAnalysisExamples(): string {
  return `# Congressional Trading Analysis Examples

## Example 1: Recent Activity Overview

### Goal: Get a quick overview of recent congressional trading

\`\`\`javascript
get_recent_congress_trading({
  mode: "summary",
  limit: 50,
  fields: ["ticker", "representative", "amount", "transaction_type"],
  format: "table"
})
\`\`\`

**Expected Output**: Clean table showing recent trades with ~1200 tokens

## Example 2: Specific Representative Analysis

### Goal: Analyze trading patterns for a specific representative

\`\`\`javascript
get_bulk_congress_trading({
  representative: "Nancy Pelosi",
  mode: "detailed",
  fields: ["ticker", "transaction_date", "amount", "transaction_type"],
  limit: 100,
  transaction_date_gte: "2024-01-01"
})
\`\`\`

## Example 3: Stock-Specific Congressional Interest

### Goal: See all congressional activity for NVIDIA

\`\`\`javascript
get_historical_congress_trading({
  ticker: "NVDA",
  mode: "detailed",
  fields: ["representative", "transaction_date", "amount", "transaction_type", "party"],
  format: "table"
})
\`\`\`

## Example 4: Large-Scale Pattern Analysis

### Goal: Find unusual trading patterns in tech stocks

\`\`\`javascript
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
\`\`\`

## Example 5: Party-Based Analysis

### Goal: Compare trading patterns between parties

\`\`\`javascript
// Get recent trades with party information
get_recent_congress_trading({
  mode: "detailed", 
  fields: ["ticker", "representative", "party", "amount", "transaction_type"],
  limit: 150,
  format: "csv" // Easy to analyze in spreadsheet
})
\`\`\`

## Example 6: Timing Analysis

### Goal: Look for trades around earnings announcements

\`\`\`javascript
get_bulk_congress_trading({
  ticker: "AAPL",
  transaction_date_gte: "2024-01-01",
  transaction_date_lte: "2024-01-31", // Earnings month
  mode: "detailed",
  fields: ["representative", "transaction_date", "disclosure_date", "amount", "transaction_type"]
})
\`\`\`

## Progressive Analysis Workflow

### Phase 1: Exploration (Budget: ~1000 tokens)
1. Use summary mode with limit: 50
2. Identify interesting patterns or representatives
3. Note unusual tickers or amounts

### Phase 2: Investigation (Budget: ~3000 tokens)  
1. Use detailed mode on specific subsets
2. Apply targeted filters (ticker, representative, dates)
3. Use table format for easier pattern recognition

### Phase 3: Deep Dive (Budget: ~5000 tokens)
1. Full detailed analysis on identified opportunities
2. Cross-reference with market events
3. Generate comprehensive reports

## Token Optimization Tips

- Start with summary mode (saves 60-80% tokens)
- Use specific date ranges to limit data
- Apply amount thresholds to filter noise
- Use representative or ticker filters for focused analysis
- Consider csv format for large numerical datasets

## Common Analysis Questions

**Q: Who are the most active traders?**
\`\`\`javascript
get_recent_congress_trading({
  mode: "detailed",
  fields: ["representative", "amount"],
  limit: 200,
  format: "csv"
})
\`\`\`

**Q: What stocks are congressional favorites?**
\`\`\`javascript  
get_recent_congress_trading({
  mode: "summary", 
  fields: ["ticker", "amount", "transaction_type"],
  limit: 300
})
\`\`\`

**Q: Are there timing patterns around disclosure?**
\`\`\`javascript
get_bulk_congress_trading({
  mode: "detailed",
  fields: ["transaction_date", "disclosure_date", "amount"],
  limit: 150,
  transaction_date_gte: "2024-01-01"
})
\`\`\`
`;
}

function getCompanyResearchExamples(): string {
  return `# Company Research Examples

## Example 1: Quick Company Overview

### Goal: Get essential information about a company

\`\`\`javascript
get_ticker_data({
  ticker: "TSLA",
  sections: ["basic", "trading"],
  mode: "summary"
})
\`\`\`

**Result**: Company fundamentals + recent trading data (~800 tokens)

## Example 2: Government Relationship Analysis

### Goal: Understand a company's government connections

\`\`\`javascript
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
\`\`\`

## Example 3: Comprehensive Tech Company Analysis

### Goal: Full analysis of a major tech company

\`\`\`javascript
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
\`\`\`

## Example 4: Defense Contractor Deep Dive

### Goal: Analyze defense industry relationships

\`\`\`javascript
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
\`\`\`

## Example 5: Comparative Analysis

### Goal: Compare multiple companies in same sector

\`\`\`javascript
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
\`\`\`

## Example 6: Event-Driven Analysis

### Goal: Analyze company around specific events

\`\`\`javascript
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
\`\`\`

## Research Workflow Templates

### Template 1: New Company Investigation
1. **Basic Info**: ticker_data with basic sections
2. **Congressional Interest**: historical_congress_trading (summary)
3. **Government Ties**: gov_contracts + lobbying (summary)
4. **Deep Dive**: Detailed analysis on interesting findings

### Template 2: Sector Analysis
1. **Company List**: get_companies with sector filter
2. **Batch Overview**: Basic data for all companies
3. **Congressional Favorites**: Identify most-traded companies
4. **Comparative Analysis**: Detail on top companies

### Template 3: Investigation Mode  
1. **Hypothesis Formation**: Summary data to identify patterns
2. **Evidence Gathering**: Detailed queries on specific findings
3. **Cross-Verification**: Multiple data sources for confirmation
4. **Timeline Analysis**: Date-ordered sequence of events

## Token Budget Planning

### Quick Research (1000-2000 tokens)
- Basic company info
- Congressional trading summary
- Government contracts overview

### Standard Analysis (3000-5000 tokens)
- Detailed trading patterns
- Lobbying analysis  
- Multi-source cross-reference

### Comprehensive Report (8000-12000 tokens)
- Full company profile
- Historical trend analysis
- Competitive comparison
- Event correlation analysis

## Optimization Strategies

1. **Modular Approach**: Use sections parameter for ticker_data
2. **Progressive Detail**: Start summary, drill down to detailed
3. **Smart Filtering**: Use date ranges and amount thresholds
4. **Format Selection**: Table for numbers, JSON for complex data
5. **Batch Processing**: Combine related queries efficiently
`;
}

function getResponseModesReference(): string {
  return `# Response Modes Reference

## Overview
QuiverMCP offers three response modes to optimize token usage based on your analysis needs.

## Mode Comparison

| Mode | Token Usage | Best For | Data Completeness |
|------|-------------|----------|-------------------|
| summary | 20-40% of detailed | Exploration, Overview | Sample + Statistics |
| compact | 10-20% of detailed | Programmatic Use | Full (compressed) |
| detailed | 100% | Final Analysis | Complete |

## Detailed Mode
**Usage**: \`mode: "detailed"\`  
**Purpose**: Complete data access
**Token Impact**: Baseline (100%)

### When to Use
- Final analysis phase
- Need complete data integrity  
- Working with small datasets (<50 records)
- Require all available fields

### Example Output
\`\`\`json
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
\`\`\`

## Summary Mode  
**Usage**: \`mode: "summary"\`
**Purpose**: Quick insights with sample data
**Token Impact**: 60-80% reduction

### When to Use
- Initial data exploration
- Large datasets (>100 records)
- Pattern identification
- Budget-conscious analysis

### Example Output
\`\`\`json
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
\`\`\`

## Compact Mode
**Usage**: \`mode: "compact"\`
**Purpose**: Maximum token efficiency  
**Token Impact**: 80-90% reduction

### When to Use
- Programmatic processing
- Data transfer to other systems
- Maximum token conservation
- API integrations

### Example Output
\`\`\`json
{
  "data": "[{\\"ticker\\":\\"AAPL\\",\\"representative\\":\\"Nancy Pelosi\\",\\"amount\\":\\"$1,000,001 - $5,000,000\\"},{\\"ticker\\":\\"TSLA\\",\\"representative\\":\\"Josh Gottheimer\\",\\"amount\\":\\"$15,001 - $50,000\\"}]",
  "summary": {
    "total_items": 1247,
    "mode": "compact"
  }
}
\`\`\`

## Mode Selection Strategy

### Progressive Analysis Workflow
1. **Start**: summary mode for exploration
2. **Identify**: Interesting patterns or outliers  
3. **Focus**: detailed mode on specific subsets
4. **Process**: compact mode for final data transfer

### Decision Tree
- Need complete data? → Use detailed mode
- Large dataset (>100 records)? → Use summary mode  
- Programmatic processing? → Use compact mode
- Otherwise → Use detailed mode

## Combining with Other Optimizations

### Summary + Field Selection
\`\`\`javascript
{
  mode: "summary",
  fields: ["ticker", "amount", "transaction_type"],
  limit: 50
}
// Result: ~400 tokens vs ~3000 tokens (87% reduction)
\`\`\`

### Summary + Format Options
\`\`\`javascript
{
  mode: "summary", 
  format: "table",
  limit: 25
}
// Result: Clean table format with minimal tokens
\`\`\`

### Detailed + Smart Limits
\`\`\`javascript
{
  mode: "detailed",
  limit: 20,
  fields: ["ticker", "representative", "amount"]
}
// Result: Complete data for focused analysis
\`\`\`

## Performance Guidelines

### Token Budget Allocation
- **Exploration (20%)**: summary mode, broad queries
- **Investigation (60%)**: detailed mode, targeted queries  
- **Processing (20%)**: compact mode, data extraction

### Best Practices
1. Always start with summary mode for unknown datasets
2. Use detailed mode only after identifying specific needs
3. Combine with field selection for maximum efficiency  
4. Use compact mode for final data processing
5. Consider pagination for very large datasets

## Common Pitfalls

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
`;
}