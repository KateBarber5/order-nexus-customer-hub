// API Proxy Service
const API_BASE_URL = 'https://order.govmetric.ai';

export const apiProxy = {
  async get(endpoint: string, params?: Record<string, string>): Promise<Response> {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    console.log('API Proxy GET request to:', url.toString());
    
    return fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  },

  async post(endpoint: string, data?: any): Promise<Response> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('API Proxy POST request to:', url);
    console.log('Request data:', data);
    
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }
};