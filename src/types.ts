export interface QuiverConfig {
  baseUrl: string;
  apiToken: string;
}

export interface APIEndpoint {
  path: string;
  method: string;
  operationId: string;
  description: string;
  summary: string;
  parameters: APIParameter[];
  responses: any;
  tags: string[];
  security: any[];
}

export interface APIParameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'body';
  required?: boolean;
  schema: {
    type: string;
    format?: string;
    enum?: string[];
  };
  description?: string;
}

export interface QuiverAPIResponse {
  data?: any;
  error?: string;
  status: number;
}