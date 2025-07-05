import { QuiverClient } from './quiver-client.js';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (client: QuiverClient, args: any) => Promise<any>;
}

export const quiverTools: MCPTool[] = [
  {
    name: 'get_companies',
    description: 'Get list of companies from QuiverAPI',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (client) => client.getCompanies()
  },
  {
    name: 'get_funds',
    description: 'Get fund information from SEC 13F data',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (client) => client.getFunds()
  },
  {
    name: 'get_recent_congress_trading',
    description: 'Get the most recent transactions by members of U.S. Congress',
    inputSchema: {
      type: 'object',
      properties: {
        normalized: {
          type: 'boolean',
          description: 'Whether to normalize the data'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of transactions to return (default: 200, which is 1/5th of typical response)'
        }
      },
      required: []
    },
    handler: async (client, args) => client.getRecentCongressTrading(args?.normalized, args?.limit)
  },
  {
    name: 'get_congress_holdings',
    description: 'Get live congress holdings data',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (client) => client.getCongressHoldings()
  },
  {
    name: 'get_recent_bill_summaries',
    description: 'Get recent bill summaries',
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
          description: 'Query to match specific issue or summary'
        },
        summary_limit: {
          type: 'number',
          description: 'Summary length limit for bill summaries'
        }
      },
      required: []
    },
    handler: async (client, args) => client.getRecentBillSummaries(args || {})
  },
  {
    name: 'get_historical_congress_trading',
    description: 'Get all stock transactions by members of U.S. Congress for a specific ticker',
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
        }
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      return client.getHistoricalCongressTrading(args.ticker, args?.normalized);
    }
  },
  {
    name: 'get_ticker_data',
    description: 'Get comprehensive ticker data for mobile application',
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
        }
      },
      required: ['ticker']
    },
    handler: async (client, args) => {
      if (!args?.ticker) throw new Error('ticker parameter is required');
      return client.getTickerData(args.ticker, args?.days);
    }
  },
  {
    name: 'get_recent_house_trading',
    description: 'Get the most recent transactions by U.S. Representatives',
    inputSchema: {
      type: 'object',
      properties: {
        normalized: {
          type: 'boolean',
          description: 'Whether to normalize the data'
        }
      },
      required: []
    },
    handler: async (client, args) => client.makeRequest('/beta/live/housetrading', 'GET', args)
  },
  {
    name: 'get_recent_senate_trading',
    description: 'Get the most recent transactions by U.S. Senators',
    inputSchema: {
      type: 'object',
      properties: {
        normalized: {
          type: 'boolean',
          description: 'Whether to normalize the data'
        }
      },
      required: []
    },
    handler: async (client, args) => client.makeRequest('/beta/live/senatetrading', 'GET', args)
  },
  {
    name: 'get_recent_gov_contracts',
    description: 'Get last quarter government contract amounts for all companies',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    },
    handler: async (client) => client.makeRequest('/beta/live/govcontracts')
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
    description: 'Get the most recent lobbying spending instances across all companies',
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
          description: 'Query to filter lobbying data'
        },
        client_name: {
          type: 'string',
          description: 'Client name filter'
        },
        registrant_name: {
          type: 'string',
          description: 'Registrant name filter'
        }
      },
      required: []
    },
    handler: async (client, args) => client.makeRequest('/beta/live/lobbying', 'GET', args)
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
    description: 'Get the full history of transactions by members of U.S. Congress',
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
        }
      },
      required: []
    },
    handler: async (client, args) => client.makeRequest('/beta/bulk/congresstrading', 'GET', args)
  }
];