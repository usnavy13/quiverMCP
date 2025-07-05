import { QuiverAPIResponse } from './types.js';

export type ResponseMode = 'compact' | 'summary' | 'detailed';
export type OutputFormat = 'json' | 'table' | 'csv';

export interface ResponseOptions {
  mode?: ResponseMode;
  format?: OutputFormat;
  fields?: string[];
  explicitFields?: boolean; // Only apply field selection if explicitly requested
  page?: number;
  page_size?: number;
  limit?: number;
}

export interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface OptimizedResponse {
  data: any;
  pagination?: PaginationInfo;
  summary?: {
    total_items: number;
    fields_included: string[];
    mode: ResponseMode;
    format: OutputFormat;
  };
}

/**
 * Formats response data based on options
 */
export function formatResponse(
  response: QuiverAPIResponse,
  options: ResponseOptions = {}
): OptimizedResponse {
  if (response.error) {
    return {
      data: { error: response.error, status: response.status }
    };
  }

  const mode = options.mode || 'detailed';
  const format = options.format || 'json';
  
  let processedData = response.data;
  
  // Apply field selection if specified AND not using default fields
  if (options.fields && Array.isArray(processedData) && options.explicitFields) {
    processedData = selectFields(processedData, options.fields);
  }
  
  // Apply pagination if specified
  if (options.page || options.page_size || options.limit) {
    const paginationResult = applyPagination(processedData, options);
    processedData = paginationResult.data;
    
    const result: OptimizedResponse = {
      data: formatOutput(processedData, format, mode),
      pagination: paginationResult.pagination,
      summary: {
        total_items: Array.isArray(response.data) ? response.data.length : 1,
        fields_included: options.fields || ['all'],
        mode,
        format
      }
    };
    
    return result;
  }
  
  return {
    data: formatOutput(processedData, format, mode),
    summary: {
      total_items: Array.isArray(response.data) ? response.data.length : 1,
      fields_included: options.fields || ['all'],
      mode,
      format
    }
  };
}

/**
 * Selects specific fields from array of objects
 */
export function selectFields(data: any[], fields: string[]): any[] {
  if (!Array.isArray(data) || !fields || fields.length === 0) return data;
  
  return data.map(item => {
    if (typeof item !== 'object' || item === null) return item;
    
    const selected: any = {};
    let hasAnyField = false;
    
    fields.forEach(field => {
      if (field in item) {
        selected[field] = item[field];
        hasAnyField = true;
      }
    });
    
    // If none of the requested fields exist, return the original item
    return hasAnyField ? selected : item;
  });
}

/**
 * Applies pagination to data
 */
export function applyPagination(data: any, options: ResponseOptions): {
  data: any;
  pagination: PaginationInfo;
} {
  if (!Array.isArray(data)) {
    return {
      data,
      pagination: {
        current_page: 1,
        page_size: 1,
        total_items: 1,
        total_pages: 1,
        has_next: false,
        has_previous: false
      }
    };
  }
  
  const limit = options.limit;
  const page = options.page || 1;
  const page_size = options.page_size || 50;
  
  // If limit is specified, apply it first
  let limitedData = data;
  if (limit && limit > 0) {
    limitedData = data.slice(0, limit);
  }
  
  // Then apply pagination
  const total_items = limitedData.length;
  const total_pages = Math.ceil(total_items / page_size);
  const start_index = (page - 1) * page_size;
  const end_index = start_index + page_size;
  
  const paginatedData = limitedData.slice(start_index, end_index);
  
  return {
    data: paginatedData,
    pagination: {
      current_page: page,
      page_size,
      total_items,
      total_pages,
      has_next: page < total_pages,
      has_previous: page > 1
    }
  };
}

/**
 * Formats output based on format and mode
 */
export function formatOutput(data: any, format: OutputFormat, mode: ResponseMode): any {
  switch (format) {
    case 'table':
      return formatAsTable(data);
    case 'csv':
      return formatAsCSV(data);
    default:
      return formatAsJSON(data, mode);
  }
}

/**
 * Formats data as JSON based on mode
 */
export function formatAsJSON(data: any, mode: ResponseMode): any {
  switch (mode) {
    case 'compact':
      return JSON.stringify(data);
    case 'summary':
      return createSummary(data);
    default:
      return data;
  }
}

/**
 * Creates a summary of the data
 */
export function createSummary(data: any): any {
  if (!Array.isArray(data)) {
    return { type: 'object', preview: data };
  }
  
  if (data.length === 0) {
    return { type: 'array', count: 0, sample: [], fields: [] };
  }
  
  // Find first non-null object to get field structure
  const firstValidObject = data.find(item => item && typeof item === 'object');
  
  const summary = {
    type: 'array',
    count: data.length,
    sample: data.slice(0, Math.min(5, data.length)), // Show up to 5 samples
    fields: firstValidObject ? Object.keys(firstValidObject) : []
  };
  
  return summary;
}

/**
 * Formats data as markdown table
 */
export function formatAsTable(data: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available';
  }
  
  const firstItem = data[0];
  if (typeof firstItem !== 'object' || firstItem === null) {
    return data.map(item => `| ${item} |`).join('\n');
  }
  
  const headers = Object.keys(firstItem);
  const headerRow = `| ${headers.join(' | ')} |`;
  const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
  
  const dataRows = data.map(item => 
    `| ${headers.map(header => String(item[header] || '')).join(' | ')} |`
  );
  
  return [headerRow, separatorRow, ...dataRows].join('\n');
}

/**
 * Formats data as CSV
 */
export function formatAsCSV(data: any): string {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available';
  }
  
  const firstItem = data[0];
  if (typeof firstItem !== 'object' || firstItem === null) {
    return data.join(',');
  }
  
  const headers = Object.keys(firstItem);
  const headerRow = headers.join(',');
  
  const dataRows = data.map(item => 
    headers.map(header => {
      const value = item[header] || '';
      // Escape commas and quotes in CSV
      return String(value).includes(',') || String(value).includes('"') 
        ? `"${String(value).replace(/"/g, '""')}"`
        : String(value);
    }).join(',')
  );
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Default field sets for common endpoints
 */
export const DEFAULT_FIELDS = {
  companies: ['ticker', 'name', 'exchange', 'market_cap'],
  funds: ['fund_name', 'cik', 'total_value', 'filing_date'],
  congress_trading: ['ticker', 'representative', 'transaction_date', 'amount', 'transaction_type'],
  congress_holdings: ['ticker', 'representative', 'value', 'shares'],
  lobbying: ['client_name', 'registrant_name', 'amount', 'date'],
  gov_contracts: ['ticker', 'amount', 'date', 'description'],
  ticker_data: {
    basic: ['ticker', 'name', 'price', 'change', 'volume'],
    trading: ['ticker', 'price', 'change', 'volume', 'high', 'low', 'open'],
    congress: ['ticker', 'recent_congress_trades', 'congress_sentiment'],
    sentiment: ['ticker', 'wsb_sentiment', 'options_flow', 'social_sentiment'],
    contracts: ['ticker', 'gov_contracts', 'lobbying_spending'],
    all: [] // Empty array means include all fields
  }
};

/**
 * Default limits for endpoints
 */
export const DEFAULT_LIMITS = {
  companies: 100,
  funds: 50,
  congress_trading: 200,
  congress_holdings: 100,
  lobbying: 50,
  gov_contracts: 50,
  bulk_data: 1000,
  ticker_data: 1 // Ticker data is per-ticker, so limit of 1
};

/**
 * Data sections for ticker data
 */
export const TICKER_DATA_SECTIONS = {
  basic: 'Basic company info and current price',
  trading: 'Trading data (price, volume, OHLC)',
  congress: 'Congressional trading activity',
  sentiment: 'Social sentiment and options flow',
  contracts: 'Government contracts and lobbying',
  all: 'All available data sections'
};

/**
 * Select specific sections from ticker data
 */
export function selectTickerDataSections(data: any, sections: string[]): any {
  if (!data || !sections || sections.includes('all')) {
    return data;
  }
  
  const sectionMap: { [key: string]: string[] } = {
    basic: ['ticker', 'name', 'price', 'change', 'volume', 'market_cap'],
    trading: ['price', 'change', 'volume', 'high', 'low', 'open', 'close', 'vwap'],
    congress: ['congress_trading', 'recent_congress_trades', 'congress_sentiment', 'congress_buys', 'congress_sells'],
    sentiment: ['wsb_sentiment', 'social_sentiment', 'options_flow', 'reddit_posts', 'twitter_sentiment'],
    contracts: ['gov_contracts', 'lobbying_spending', 'contract_awards', 'lobbying_clients']
  };
  
  const fieldsToInclude = new Set<string>();
  sections.forEach(section => {
    if (sectionMap[section]) {
      sectionMap[section].forEach(field => fieldsToInclude.add(field));
    }
  });
  
  const filtered: any = {};
  Object.keys(data).forEach(key => {
    if (fieldsToInclude.has(key)) {
      filtered[key] = data[key];
    }
  });
  
  return Object.keys(filtered).length > 0 ? filtered : data;
}