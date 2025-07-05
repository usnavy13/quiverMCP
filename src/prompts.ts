export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    required?: boolean;
  }[];
}

export interface PromptMessage {
  role: 'user' | 'assistant';
  content: {
    type: 'text';
    text: string;
  };
}

export const quiverPrompts: MCPPrompt[] = [
  {
    name: 'analyze-congress-trading',
    description: 'Guide analysis of congressional trading patterns for a specific ticker or representative',
    arguments: [
      {
        name: 'ticker',
        description: 'Stock ticker symbol to analyze',
        required: false
      },
      {
        name: 'representative',
        description: 'Representative name to analyze',
        required: false
      },
      {
        name: 'timeframe',
        description: 'Analysis timeframe (recent, historical, or both)',
        required: false
      }
    ]
  },
  {
    name: 'company-deep-dive',
    description: 'Comprehensive analysis workflow for a specific company',
    arguments: [
      {
        name: 'ticker',
        description: 'Stock ticker symbol to analyze',
        required: true
      },
      {
        name: 'focus_areas',
        description: 'Specific areas to focus on: trading, government, lobbying, sentiment',
        required: false
      }
    ]
  },
  {
    name: 'government-influence-analysis',
    description: 'Analyze government influence on markets through contracts and lobbying',
    arguments: [
      {
        name: 'sector',
        description: 'Industry sector to focus on',
        required: false
      },
      {
        name: 'timeframe',
        description: 'Time period for analysis',
        required: false
      }
    ]
  },
  {
    name: 'optimize-query-strategy',
    description: 'Guide users on optimizing their data queries to reduce token usage',
    arguments: [
      {
        name: 'data_type',
        description: 'Type of data being queried (congress, lobbying, contracts, etc.)',
        required: true
      },
      {
        name: 'analysis_goal',
        description: 'What the user wants to accomplish with the data',
        required: false
      }
    ]
  }
];

export function getPrompt(name: string, args: Record<string, any> = {}): PromptMessage[] {
  switch (name) {
    case 'analyze-congress-trading':
      return getCongressTradingAnalysisPrompt(args);
    case 'company-deep-dive':
      return getCompanyDeepDivePrompt(args);
    case 'government-influence-analysis':
      return getGovernmentInfluencePrompt(args);
    case 'optimize-query-strategy':
      return getOptimizeQueryPrompt(args);
    default:
      throw new Error(`Unknown prompt: ${name}`);
  }
}

function getCongressTradingAnalysisPrompt(args: Record<string, any>): PromptMessage[] {
  const ticker = args.ticker || '[TICKER]';
  const representative = args.representative || '[REPRESENTATIVE]';
  const timeframe = args.timeframe || 'both recent and historical';
  
  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to analyze congressional trading patterns${ticker !== '[TICKER]' ? ` for ${ticker}` : ''}${representative !== '[REPRESENTATIVE]' ? ` by ${representative}` : ''}. Please help me conduct a comprehensive analysis using ${timeframe} data.`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll help you analyze congressional trading patterns. Here's a structured approach:

**Step 1: Get Recent Activity**
Use \`get_recent_congress_trading\` with these optimization parameters:
- mode: "summary" (for overview) or "detailed" (for full analysis)  
- fields: ["ticker", "representative", "transaction_date", "amount", "transaction_type"]
- limit: 50-100 (to start with manageable data)
${ticker !== '[TICKER]' ? `- Include ticker filter in your analysis` : ''}

**Step 2: Historical Context** 
${ticker !== '[TICKER]' ? `Use \`get_historical_congress_trading\` with ticker="${ticker}"` : 'Use \`get_bulk_congress_trading\` with appropriate filters'}
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

Would you like me to start with recent trading activity, or do you have a specific aspect you'd like to focus on first?`
      }
    }
  ];
}

function getCompanyDeepDivePrompt(args: Record<string, any>): PromptMessage[] {
  const ticker = args.ticker;
  const focusAreas = args.focus_areas || 'all available data';
  
  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to conduct a comprehensive analysis of ${ticker}. Please guide me through a deep dive focusing on ${focusAreas}.`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll guide you through a comprehensive analysis of ${ticker}. Here's the optimal approach:

**Step 1: Company Overview**
Use \`get_ticker_data\` with:
- ticker: "${ticker}"  
- sections: ["basic", "trading"] (start with essentials)
- mode: "summary" (for initial overview)

**Step 2: Congressional Activity**
\`get_historical_congress_trading\` with:
- ticker: "${ticker}"
- mode: "detailed"
- fields: ["representative", "transaction_date", "amount", "transaction_type"]

**Step 3: Government Relationships**
\`get_historical_gov_contracts\` and \`get_historical_lobbying\` with:
- ticker: "${ticker}"
- mode: "summary" (contracts can be large datasets)
- Use pagination if needed

**Step 4: Market Sentiment** (if available)
Use \`get_ticker_data\` with:
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

Which area would you like to start with, or shall I begin with the company overview?`
      }
    }
  ];
}

function getGovernmentInfluencePrompt(args: Record<string, any>): PromptMessage[] {
  const sector = args.sector || 'across all sectors';
  const timeframe = args.timeframe || 'recent data';
  
  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to analyze government influence on markets ${sector !== 'across all sectors' ? `in the ${sector} sector` : sector} using ${timeframe}.`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `I'll help you analyze government influence on markets. Here's a systematic approach:

**Step 1: Government Contracts Analysis**
Use \`get_recent_gov_contracts_all\` with:
- mode: "summary" (large dataset)
- page_size: 50 (manageable chunks)
${sector !== 'across all sectors' ? `- query: "${sector}" (to filter by sector)` : ''}
- format: "table" (easier to read financial data)

**Step 2: Lobbying Activity**
Use \`get_recent_lobbying\` with:
- mode: "detailed"
- fields: ["client_name", "registrant_name", "amount", "date"]
${sector !== 'across all sectors' ? `- query: "${sector}"` : ''}
- page_size: 30

**Step 3: Congressional Trading Patterns**
Use \`get_recent_congress_trading\` with:
- mode: "detailed"
- fields: ["ticker", "representative", "amount", "transaction_type"]
- limit: 100

**Step 4: Cross-Reference Analysis**
- Identify companies receiving major contracts
- Look for congressional trading around contract announcements
- Analyze lobbying spending vs contract awards
- Track timing patterns

**Step 5: Sector-Specific Insights** ${sector !== 'across all sectors' ? `(${sector} focus)` : ''}
- Compare contract amounts across companies
- Identify key lobbying themes
- Track representative trading patterns in sector stocks

**Token Efficiency Tips:**
- Use "summary" mode for initial data exploration
- Apply query filters to focus on relevant data
- Use pagination to process large datasets in chunks
- Consider "csv" format for numerical analysis

Would you like to start with government contracts, or do you have a specific angle you'd like to explore first?`
      }
    }
  ];
}

function getOptimizeQueryPrompt(args: Record<string, any>): PromptMessage[] {
  const dataType = args.data_type;
  const analysisGoal = args.analysis_goal || 'general analysis';
  
  return [
    {
      role: 'user',
      content: {
        type: 'text',
        text: `I want to optimize my queries for ${dataType} data. My goal is ${analysisGoal}. How can I reduce token usage while getting the data I need?`
      }
    },
    {
      role: 'assistant',
      content: {
        type: 'text',
        text: `Great question! Here are optimization strategies for ${dataType} data:

**Response Mode Optimization:**
- \`mode: "summary"\` - Best for large datasets, provides overview with sample data
- \`mode: "compact"\` - Returns JSON string, most token-efficient for processing
- \`mode: "detailed"\` - Full data, use only when you need complete information

**Field Selection:**
- \`fields: []\` - Specify only the columns you need
- Default fields for ${dataType}: ${getDefaultFieldsForDataType(dataType)}
- Avoid \`fields: ["all"]\` unless absolutely necessary

**Pagination & Limits:**
- \`limit: N\` - Cap total results (e.g., limit: 50 for initial exploration)
- \`page_size: N\` - Control chunk size (20-50 recommended)
- \`page: N\` - Process data in batches

**Format Options:**
- \`format: "table"\` - Great for numerical data, easier to read
- \`format: "csv"\` - Most compact for large datasets
- \`format: "json"\` - Default, most flexible

**Data Type Specific Tips:**
${getDataTypeSpecificTips(dataType)}

**Recommended Starting Query:**
\`\`\`
{
  // your specific parameters
  mode: "summary",
  limit: 25,
  fields: ${JSON.stringify(getDefaultFieldsForDataType(dataType))}
}
\`\`\`

**Analysis Goal Optimization for "${analysisGoal}":**
${getAnalysisGoalTips(analysisGoal)}

Would you like me to help you craft an optimized query for your specific use case?`
      }
    }
  ];
}

function getDefaultFieldsForDataType(dataType: string): string[] {
  switch (dataType) {
    case 'congress':
      return ['ticker', 'representative', 'transaction_date', 'amount', 'transaction_type'];
    case 'lobbying':
      return ['client_name', 'registrant_name', 'amount', 'date'];
    case 'contracts':
      return ['ticker', 'amount', 'date', 'description'];
    case 'companies':
      return ['ticker', 'name', 'exchange', 'market_cap'];
    case 'funds':
      return ['fund_name', 'cik', 'total_value', 'filing_date'];
    default:
      return ['essential fields only'];
  }
}

function getDataTypeSpecificTips(dataType: string): string {
  switch (dataType) {
    case 'congress':
      return `- Use date filters (transaction_date_gte/lte) to limit timeframes
- Filter by ticker or representative to focus analysis
- Start with limit: 100 for recent data, 50 for historical`;
    case 'lobbying':
      return `- Use query parameter to filter by topic/industry
- Set page_size: 30 (lobbying data can be verbose)
- Consider client_name or registrant_name filters`;
    case 'contracts':
      return `- Government contract data can be large - always use limits
- Query parameter helps filter by keywords
- Consider date ranges for recent vs historical analysis`;
    case 'ticker_data':
      return `- Use sections parameter: ["basic", "trading", "congress", "sentiment", "contracts"]
- Start with sections: ["basic"] for overview
- This is the largest dataset - always use summary mode initially`;
    default:
      return `- Apply appropriate filters for your data type
- Start with small limits and increase as needed
- Use summary mode for initial exploration`;
  }
}

function getAnalysisGoalTips(goal: string): string {
  if (goal.toLowerCase().includes('overview') || goal.toLowerCase().includes('summary')) {
    return 'Use mode: "summary" and limit: 20-50 for quick insights';
  }
  if (goal.toLowerCase().includes('trend') || goal.toLowerCase().includes('pattern')) {
    return 'Focus on date fields and use time-based filters, format: "table" for easier pattern recognition';
  }
  if (goal.toLowerCase().includes('specific') || goal.toLowerCase().includes('detailed')) {
    return 'Use targeted filters (ticker, representative, etc.) and detailed mode only for final analysis';
  }
  return 'Start with summary mode and gradually drill down to detailed data as needed';
}