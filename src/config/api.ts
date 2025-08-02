// API Configuration
// Change this value to switch between development and production API endpoints
const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = isDevelopment 
  ? '' // Use relative URLs in development (handled by Vite proxy)
  : (import.meta.env.VITE_API_BASE_URL || 'https://govmetricai-h0h4crd6a6gregbm.eastus-01.azurewebsites.net');

// For development, the proxy will handle the requests
// For production, use the full URL

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    LOGIN: '/GovMetricAPI/GovmetricLogin',
    GET_ORDERS: '/GovMetricAPI/GetOrders',
    GET_PLACES: '/GovMetricAPI/GetPlaces',
    CHECK_MUNICIPALITY_BY_PARCEL: '/GovMetricAPI/CheckMunicipalityAvailabilityByParcel',
    CHECK_MUNICIPALITY_BY_ADDRESS: '/GovMetricAPI/CheckMunicipalityAvailabilityByAddress',
    CRUD_COUNTY: '/GovMetricAPI/CrudCounty',
    CRUD_MUNICIPALITY: '/GovMetricAPI/CrudMunicipality',
    GET_ORGANIZATIONS: '/GovMetricAPI/GetOrganizations',
    POST_REPORT_REQUEST_BY_PARCEL: '/GovMetricAPI/PostReportRequestByParcel',
    POST_REPORT_REQUEST_BY_ADDRESS: '/GovMetricAPI/PostReportRequestByAddress',
    GET_ALL_AVAILABLE_SERVICES: '/GovMetricAPI/GetAllAvailableServices',
    GET_ADMIN_ORDER_REPORTING: '/GovMetricAPI/GetAdminOrderReporting',
    CRUD_ACCOUNT: '/GovMetricAPI/CrudAccount',
    GET_SYSTEM_PARAMETER: '/GovMetricAPI/GetSystemParameter',
    GET_USER_PROFILE: '/GovMetricAPI/GetUserProfile',
    POST_CHANGE_PASSWORD: '/GovMetricAPI/PostChangePassword',
    UPDATE_ORGANIZATION_SUBSCRIPTION: '/GovMetricAPI/UptateOrganizationSubscription',
    SET_GOV_ORDER_PAID_STATUS: '/GovMetricAPI/SetGovOrderPaidStatus',
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  // In development, use relative URLs (handled by Vite proxy)
  // In production, use full URLs
  const baseUrl = API_CONFIG.BASE_URL;
  const fullUrl = baseUrl ? `${baseUrl}${endpoint}` : endpoint;
  
  const url = new URL(fullUrl, window.location.origin);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
};

// Helper function to make API requests
export const apiRequest = {
  async get(endpoint: string, params?: Record<string, string>): Promise<Response> {
    const url = buildApiUrl(endpoint, params);
    console.log('API GET request to:', url);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      // Check if it's a message port error
      if (error instanceof Error && 
          (error.message.includes('message port') || error.message.includes('asynchronous response'))) {
        console.log('Message port error in API request, throwing timeout error instead');
        throw new Error('Request timed out due to connection issues. Please try again.');
      }
      
      // Check if it's an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  },

  async post(endpoint: string, data?: any): Promise<Response> {
    const url = buildApiUrl(endpoint);
    console.log('API POST request to:', url);
    console.log('Request data:', data);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      // Check if it's a message port error
      if (error instanceof Error && 
          (error.message.includes('message port') || error.message.includes('asynchronous response'))) {
        console.log('Message port error in API request, throwing timeout error instead');
        throw new Error('Request timed out due to connection issues. Please try again.');
      }
      
      // Check if it's an abort error (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  }
};