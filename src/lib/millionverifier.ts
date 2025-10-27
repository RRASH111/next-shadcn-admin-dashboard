export interface SingleVerificationResult {
  email: string;
  quality: string;
  result: 'ok' | 'catch_all' | 'unknown' | 'error' | 'disposable' | 'invalid';
  resultcode: 1 | 2 | 3 | 4 | 5 | 6;
  subresult: string;
  free: boolean;
  role: boolean;
  didyoumean: string;
  credits: number;
  executiontime: number;
  error: string;
  livemode: boolean;
}

export interface CreditsResponse {
  credits: number;
  bulk_credits: number;
  renewing_credits: number;
  plan: number;
}

export interface BulkUploadResult {
  file_id: string;
  file_name: string;
  status: string;
  unique_emails: number;
  updated_at: string;
  createdate: string;
  percent: number;
  total_rows: number;
  verified: number;
  unverified: number;
  ok: number;
  catch_all: number;
  disposable: number;
  invalid: number;
  unknown: number;
  reverify: number;
  credit: number;
  estimated_time_sec: number;
  error: string;
}

export interface BulkFileListResponse {
  files: BulkUploadResult[];
  total: number;
}

export class MillionVerifierAPI {
  private apiKey: string;
  private baseUrl = 'https://api.millionverifier.com';
  private bulkUrl = 'https://bulkapi.millionverifier.com';

  constructor() {
    this.apiKey = process.env.MILLION_VERIFIER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('MILLION_VERIFIER_API_KEY environment variable is not set');
    }
  }

  async verifyEmail(email: string, timeout = 20): Promise<SingleVerificationResult> {
    const response = await fetch(
      `${this.baseUrl}/api/v3/?api=${this.apiKey}&email=${encodeURIComponent(email)}&timeout=${timeout}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  }

  async getCredits(): Promise<CreditsResponse> {
    const response = await fetch(
      `${this.baseUrl}/api/v3/credits?api=${this.apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  }

  async uploadBulkFile(file: File): Promise<BulkUploadResult> {
    const formData = new FormData();
    formData.append('file_contents', file);
    
    const response = await fetch(
      `${this.bulkUrl}/bulkapi/v2/upload?key=${this.apiKey}`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  }

  async getBulkFileInfo(fileId: string): Promise<BulkUploadResult> {
    const response = await fetch(
      `${this.bulkUrl}/bulkapi/v2/fileinfo?key=${this.apiKey}&file_id=${fileId}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  }

  async getBulkFileList(filters?: {
    offset?: number;
    limit?: number;
    id?: string;
    name?: string;
    status?: string;
    updated_at_from?: string;
    updated_at_to?: string;
    createdate_from?: string;
    createdate_to?: string;
    percent_from?: number;
    percent_to?: number;
    has_error?: string;
  }): Promise<BulkFileListResponse> {
    const params = new URLSearchParams({ key: this.apiKey });
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(
      `${this.bulkUrl}/bulkapi/v2/filelist?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return result;
  }

  async downloadBulkResults(
    fileId: string, 
    filter: 'ok' | 'ok_and_catch_all' | 'unknown' | 'invalid' | 'all' | 'custom' = 'all',
    options?: {
      statuses?: string;
      free?: '1' | '0';
      role?: '1' | '0';
    }
  ): Promise<Response> {
    const params = new URLSearchParams({
      key: this.apiKey,
      file_id: fileId,
      filter
    });
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(
      `${this.bulkUrl}/bulkapi/v2/download?${params}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  }

  async stopBulkProcessing(fileId: string): Promise<{ result?: string; error?: string }> {
    const response = await fetch(
      `${this.bulkUrl}/bulkapi/stop?key=${this.apiKey}&file_id=${fileId}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  async deleteBulkFile(fileId: string): Promise<{ result?: string; error?: string }> {
    const response = await fetch(
      `${this.bulkUrl}/bulkapi/v2/delete?key=${this.apiKey}&file_id=${fileId}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }
}

export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleMillionVerifierError(response: any): never {
  if (response.error) {
    switch (response.error) {
      case 'apikey_not_found':
        throw new APIError(401, 'Invalid API key', 'INVALID_API_KEY');
      case 'insufficient_credits':
        throw new APIError(402, 'Insufficient credits', 'INSUFFICIENT_CREDITS');
      case 'No email specified':
        throw new APIError(400, 'Email address is required', 'MISSING_EMAIL');
      case 'parameter file_id is empty':
        throw new APIError(400, 'File ID is required', 'MISSING_FILE_ID');
      case 'file_not_found':
        throw new APIError(404, 'File not found', 'FILE_NOT_FOUND');
      case 'unsupported filter value':
        throw new APIError(400, 'Unsupported filter value', 'INVALID_FILTER');
      default:
        throw new APIError(400, response.error, 'API_ERROR');
    }
  }
  
  throw new APIError(500, 'Unknown API error', 'UNKNOWN_ERROR');
}
