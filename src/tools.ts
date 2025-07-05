import { QuiverClient } from './quiver-client.js';
import { formatResponse, ResponseOptions, DEFAULT_FIELDS, DEFAULT_LIMITS, TICKER_DATA_SECTIONS, selectTickerDataSections } from './response-utils.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (client: QuiverClient, args: any) => Promise<any>;
}

// Common response options schema
const responseOptionsSchema = {
  mode: {
    type: 'string',
    enum: ['compact', 'summary', 'detailed'],
    description: 'Response mode: compact (JSON string), summary (overview), detailed (full data)'
  },
  format: {
    type: 'string',
    enum: ['json', 'table', 'csv'],
    description: 'Output format: json, table (markdown), or csv'
  },
  fields: {
    type: 'array',
    items: { type: 'string' },
    description: 'Specific fields to include in response'
  },
  page: {
    type: 'number',
    description: 'Page number for pagination (starts at 1)'
  },
  page_size: {
    type: 'number',
    description: 'Number of items per page'
  },
  limit: {
    type: 'number',
    description: 'Maximum number of items to return'
  }
};

export const quiverTools: MCPTool[] = [
  {
    name: 'get_companies',
    description: 'Get list of companies from QuiverAPI. Returns ticker, name, exchange, market_cap by default. Use search to filter companies and fields parameter to customize output.',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search companies by name, ticker, or other attributes'
        },
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const response = await client.getCompanies(args?.search);
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit || DEFAULT_LIMITS.companies
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_funds',
    description: 'Get fund information from SEC 13F data. Returns fund_name, cik, total_value, filing_date by default. Use search to filter funds.',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search funds by name, CIK, or other attributes'
        },
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const response = await client.getFunds(args?.search);
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit || DEFAULT_LIMITS.funds
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_recent_congress_trading',
    description: 'Get the most recent transactions by members of U.S. Congress. Returns ticker, representative, transaction_date, amount, transaction_type by default.',
    inputSchema: {
      type: 'object',
      properties: {
        normalized: {
          type: 'boolean',
          description: 'Whether to normalize the data'
        },
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const response = await client.getRecentCongressTrading(args?.normalized, args?.limit);
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit || DEFAULT_LIMITS.congress_trading
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_congress_holdings',
    description: 'Get live congress holdings data. Returns ticker, representative, value, shares by default.',
    inputSchema: {
      type: 'object',
      properties: {
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const response = await client.getCongressHoldings();
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit || DEFAULT_LIMITS.congress_holdings
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_recent_bill_summaries',
    description: 'Get recent bill summaries. Supports pagination and summary length limits.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Query to match specific issue or summary'
        },
        summary_limit: {
          type: 'number',
          description: 'Summary length limit for bill summaries'
        },
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const apiParams = {
        page: args?.page,
        page_size: args?.page_size,
        query: args?.query,
        summary_limit: args?.summary_limit
      };
      const response = await client.getRecentBillSummaries(apiParams);
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        limit: args?.limit
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_historical_congress_trading',
    description: 'Get all stock transactions by members of U.S. Congress for a specific ticker. Returns essential trading fields by default. Use summary mode for large datasets.',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol'
        },
        normalized: {
          type: 'boolean',
          description: 'Whether to normalize the data'
        },
        ...responseOptionsSchema
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      const response = await client.getHistoricalCongressTrading(args.ticker, args?.normalized);
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit || DEFAULT_LIMITS.congress_trading
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_ticker_data',
    description: 'Get comprehensive ticker data for mobile application. Large dataset - use summary mode for overview, sections parameter for modular data, or specify fields for focused data. Available sections: basic, trading, congress, sentiment, contracts, all.',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol'
        },
        days: {
          type: 'number',
          description: 'Number of days of data to retrieve'
        },
        sections: {
          type: 'array',
          items: { 
            type: 'string',
            enum: ['basic', 'trading', 'congress', 'sentiment', 'contracts', 'all']
          },
          description: 'Data sections to include: basic (company info), trading (OHLC), congress (congressional trading), sentiment (social data), contracts (gov contracts/lobbying), all (everything)'
        },
        ...responseOptionsSchema
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      const response = await client.getTickerData(args.ticker, args?.days);
      
      // Apply section filtering if specified
      if (response.data && args?.sections && !args.sections.includes('all')) {
        response.data = selectTickerDataSections(response.data, args.sections);
      }
      
      const options: ResponseOptions = {
        mode: args?.mode || 'summary',
        format: args?.format || 'json',
        fields: args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_recent_house_trading',
    description: 'Get the most recent transactions by U.S. Representatives. Returns essential trading fields by default.',
    inputSchema: {
      type: 'object',
      properties: {
        normalized: {
          type: 'boolean',
          description: 'Whether to normalize the data'
        },
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const apiParams = {
        normalized: args?.normalized
      };
      const response = await client.makeRequest('/beta/live/housetrading', 'GET', apiParams);
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit || DEFAULT_LIMITS.congress_trading
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_recent_senate_trading',
    description: 'Get the most recent transactions by U.S. Senators. Returns essential trading fields by default.',
    inputSchema: {
      type: 'object',
      properties: {
        normalized: {
          type: 'boolean',
          description: 'Whether to normalize the data'
        },
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const apiParams = {
        normalized: args?.normalized
      };
      const response = await client.makeRequest('/beta/live/senatetrading', 'GET', apiParams);
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit || DEFAULT_LIMITS.congress_trading
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_recent_gov_contracts',
    description: 'Get last quarter government contract amounts for all companies. Returns essential contract information by default.',
    inputSchema: {
      type: 'object',
      properties: {
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const response = await client.makeRequest('/beta/live/govcontracts');
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        page: args?.page,
        page_size: args?.page_size,
        limit: args?.limit || DEFAULT_LIMITS.gov_contracts
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_recent_gov_contracts_all',
    description: 'Get recently announced contracts across all companies',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Page number'
        },
        page_size: {
          type: 'number',
          description: 'Items per page'
        },
        query: {
          type: 'string',
          description: 'Query to filter contracts'
        }
      },
      required: []
    },
    handler: async (client, args) => client.makeRequest('/beta/live/govcontractsall', 'GET', args)
  },
  {
    name: 'get_recent_lobbying',
    description: 'Get the most recent lobbying spending instances across all companies. Returns client_name, registrant_name, amount, date by default.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Query to filter lobbying data'
        },
        client_name: {
          type: 'string',
          description: 'Client name filter'
        },
        registrant_name: {
          type: 'string',
          description: 'Registrant name filter'
        },
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const apiParams = {
        page: args?.page,
        page_size: args?.page_size,
        query: args?.query,
        client_name: args?.client_name,
        registrant_name: args?.registrant_name
      };
      const response = await client.makeRequest('/beta/live/lobbying', 'GET', apiParams);
      const options: ResponseOptions = {
        mode: args?.mode || 'detailed',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        limit: args?.limit || DEFAULT_LIMITS.lobbying
      };
      return formatResponse(response, options);
    }
  },
  {
    name: 'get_recent_legislation',
    description: 'Get recent legislation data',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (client) => client.makeRequest('/beta/live/legislation')
  },
  {
    name: 'get_live_off_exchange',
    description: 'Get yesterdays off-exchange activity across all companies',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'number',
          description: 'Page number'
        },
        page_size: {
          type: 'number',
          description: 'Items per page'
        }
      },
      required: []
    },
    handler: async (client, args) => client.makeRequest('/beta/live/offexchange', 'GET', args)
  },
  {
    name: 'get_historical_gov_contracts',
    description: 'Get historical quarterly government contracts amounts for a ticker',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol'
        }
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      return client.makeRequest(`/beta/historical/govcontracts/${args.ticker}`);
    }
  },
  {
    name: 'get_historical_gov_contracts_all',
    description: 'Get historical government contracts for a ticker',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol'
        }
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      return client.makeRequest(`/beta/historical/govcontractsall/${args.ticker}`);
    }
  },
  {
    name: 'get_historical_house_trading',
    description: 'Get all stock transactions by U.S. Representatives for a ticker',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol'
        }
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      return client.makeRequest(`/beta/historical/housetrading/${args.ticker}`);
    }
  },
  {
    name: 'get_historical_senate_trading',
    description: 'Get all stock transactions by U.S. Senators for a ticker',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol'
        }
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      return client.makeRequest(`/beta/historical/senatetrading/${args.ticker}`);
    }
  },
  {
    name: 'get_historical_lobbying',
    description: 'Get all lobbying spending instances for a ticker',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol'
        },
        page: {
          type: 'number',
          description: 'Page number'
        },
        page_size: {
          type: 'number',
          description: 'Items per page'
        },
        query: {
          type: 'string',
          description: 'Query to filter lobbying data'
        },
        client_name: {
          type: 'string',
          description: 'Client name filter'
        }
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      return client.makeRequest(`/beta/historical/lobbying/${args.ticker}`, 'GET', args);
    }
  },
  {
    name: 'get_historical_off_exchange',
    description: 'Get daily historical off-exchange activity for a ticker',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Stock ticker symbol'
        }
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      return client.makeRequest(`/beta/historical/offexchange/${args.ticker}`);
    }
  },
  {
    name: 'get_bulk_congress_trading',
    description: 'Get the full history of transactions by members of U.S. Congress. LARGE DATASET - strongly recommend using summary mode and filters to reduce response size.',
    inputSchema: {
      type: 'object',
      properties: {
        ticker: {
          type: 'string',
          description: 'Filter by ticker symbol'
        },
        representative: {
          type: 'string',
          description: 'Filter by representative name'
        },
        transaction_date_gte: {
          type: 'string',
          description: 'Filter by transaction date (greater than or equal)'
        },
        transaction_date_lte: {
          type: 'string',
          description: 'Filter by transaction date (less than or equal)'
        },
        amount_gte: {
          type: 'number',
          description: 'Filter by amount (greater than or equal)'
        },
        amount_lte: {
          type: 'number',
          description: 'Filter by amount (less than or equal)'
        },
        transaction_type: {
          type: 'string',
          description: 'Filter by transaction type'
        },
        ...responseOptionsSchema
      },
      required: []
    },
    handler: async (client, args) => {
      const apiParams = {
        page: args?.page,
        page_size: args?.page_size,
        ticker: args?.ticker,
        representative: args?.representative,
        transaction_date_gte: args?.transaction_date_gte,
        transaction_date_lte: args?.transaction_date_lte,
        amount_gte: args?.amount_gte,
        amount_lte: args?.amount_lte,
        transaction_type: args?.transaction_type
      };
      const response = await client.makeRequest('/beta/bulk/congresstrading', 'GET', apiParams);
      const options: ResponseOptions = {
        mode: args?.mode || 'summary',
        format: args?.format || 'json',
        fields: args?.fields,
        explicitFields: !!args?.fields,
        limit: args?.limit || DEFAULT_LIMITS.bulk_data
      };
      return formatResponse(response, options);
    }
  }
];