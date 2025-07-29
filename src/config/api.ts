// API Configuration
// Change this value to switch between development and production API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://order.govmetric.ai';

// For development, you can use:
// const API_BASE_URL = 'http://localhost:8080'; // or your local dev server
// const API_BASE_URL = 'https://order.govmetric.ai'; // for production

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
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  
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
    
    return fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  },

  async post(endpoint: string, data?: any): Promise<Response> {
    const url = buildApiUrl(endpoint);
    console.log('API POST request to:', url);
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