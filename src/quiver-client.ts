import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { QuiverConfig, QuiverAPIResponse } from './types.js';

export class QuiverClient {
  private client: AxiosInstance;
  private config: QuiverConfig;

  constructor(config: QuiverConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: 30000,
      headers: {
        'Authorization': `Token ${config.apiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'QuiverMCP/1.0.0'
      }
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error(`API Error: ${error.response?.status} - ${error.response?.statusText}`);
        return Promise.reject(error);
      }
    );
  }

  async makeRequest(
    path: string,
    method: string = 'GET',
    params: Record<string, any> = {},
    data?: any
  ): Promise<QuiverAPIResponse> {
    try {
      const config: AxiosRequestConfig = {
        method: method.toLowerCase() as any,
        url: path,
        params: method === 'GET' ? params : undefined,
        data: method !== 'GET' ? data : undefined
      };

      const response: AxiosResponse = await this.client.request(config);
      
      return {
        data: response.data,
        status: response.status
      };
    } catch (error: any) {
      return {
        error: error.response?.data?.message || error.message || 'Unknown error',
        status: error.response?.status || 500
      };
    }
  }

  // Specific methods for common endpoints
  async getCompanies(): Promise<QuiverAPIResponse> {
    return this.makeRequest('/beta/companies');
  }

  async getFunds(): Promise<QuiverAPIResponse> {
    return this.makeRequest('/beta/funds');
  }

  async getRecentCongressTrading(normalized?: boolean): Promise<QuiverAPIResponse> {
    return this.makeRequest('/beta/live/congresstrading', 'GET', { normalized });
  }

  async getCongressHoldings(): Promise<QuiverAPIResponse> {
    return this.makeRequest('/beta/live/congressholdings');
  }

  async getRecentBillSummaries(params: {
    page?: number;
    page_size?: number;
    query?: string;
    summary_limit?: number;
  } = {}): Promise<QuiverAPIResponse> {
    return this.makeRequest('/beta/live/bill_summaries', 'GET', params);
  }

  async getHistoricalCongressTrading(ticker: string, normalized?: boolean): Promise<QuiverAPIResponse> {
    return this.makeRequest(`/beta/historical/congresstrading/${ticker}`, 'GET', { normalized });
  }

  async getTickerData(ticker: string, days?: number): Promise<QuiverAPIResponse> {
    return this.makeRequest(`/beta/mobile/ticker/${ticker}`, 'GET', { days });
  }
}