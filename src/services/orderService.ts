
// API Response interface matching the provided JSON structure
export interface GovOrderResponse {
  GovOrderID: string;
  OrganizationID: number;
  UserGuid: string;
  GovOrderAddress: string;
  GovOrderStreetName: string;
  GovOrderCounty: string;
  GovOrderStreetNumber: string;
  GovOrderStatus: string;
  GovOrderStreetType: string;
  GovOrderStreetDirection: string;
  GovOrderParcel: string;
  GovOrderZipCode: string;
  GovOrderSearchType: string;
  GovOrderReportType: string;
  GovOrderReportBlobFile: string;
  GovOrderReportFileName: string;
  GovOrderReportFilePath: string;
  GovOrderRequestID: string;
  GovOrderCreateDateTime: string;
  GovOrderLogs: string;
  GovOrderMessage: string;
  GovOrderTries: number;
}

// Transformed order interface for the frontend
export interface Order {
  id: string;
  address: string;
  parcelId: string;
  county: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'failed';
  createdAt: string;
  updatedAt: string;
  reportFileName?: string;
  reportFilePath?: string;
}

// Transform API response to frontend format
const transformGovOrderToOrder = (govOrder: GovOrderResponse): Order => {
  // Map status from API format to frontend format
  const statusMapping: Record<string, 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'failed'> = {
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'IN_RESEARCH': 'shipped', // Maps to "In Research" which is "shipped" in the UI
    'COMPLETED': 'delivered',
    'CANCELED': 'canceled',
    'FAILED': 'failed'
  };

  return {
    id: govOrder.GovOrderID,
    address: govOrder.GovOrderAddress,
    parcelId: govOrder.GovOrderParcel,
    county: govOrder.GovOrderCounty,
    status: statusMapping[govOrder.GovOrderStatus] || 'pending',
    createdAt: govOrder.GovOrderCreateDateTime,
    updatedAt: govOrder.GovOrderCreateDateTime,
    reportFileName: govOrder.GovOrderReportFileName,
    reportFilePath: govOrder.GovOrderReportFilePath
  };
};

// Generate mock data for development/testing
const generateMockOrders = (): Order[] => {
  return [
    {
      id: "GOV001",
      address: "123 Main St, Miami, FL 33101",
      parcelId: "25-3218-000-0010",
      county: "Miami-Dade",
      status: "delivered",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-16T14:20:00Z",
      reportFileName: "Municipal_Lien_Search_GOV001.pdf",
      reportFilePath: "Orders/Municipal_Lien_Search_GOV001.pdf"
    },
    {
      id: "GOV002",
      address: "456 Ocean Ave, Orlando, FL 32801",
      parcelId: "18-2314-000-0025",
      county: "Orange",
      status: "processing",
      createdAt: "2024-01-14T09:15:00Z",
      updatedAt: "2024-01-14T09:15:00Z"
    },
    {
      id: "GOV003",
      address: "789 Beach Blvd, Tampa, FL 33602",
      parcelId: "19-4567-000-0033",
      county: "Hillsborough",
      status: "shipped",
      createdAt: "2024-01-13T16:45:00Z",
      updatedAt: "2024-01-14T08:30:00Z"
    },
    {
      id: "GOV004",
      address: "321 Palm St, Jacksonville, FL 32202",
      parcelId: "16-1234-000-0012",
      county: "Duval",
      status: "failed",
      createdAt: "2024-01-12T11:20:00Z",
      updatedAt: "2024-01-12T15:10:00Z"
    },
    {
      id: "GOV005",
      address: "654 Sunset Dr, Fort Lauderdale, FL 33301",
      parcelId: "12-5678-000-0089",
      county: "Broward",
      status: "canceled",
      createdAt: "2024-01-11T13:00:00Z",
      updatedAt: "2024-01-11T14:30:00Z"
    }
  ];
};

// Fetch orders from the API
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    console.log('Fetching orders from API...');
    console.log('API URL:', '/api/GovMetricAPI/GetOrders');
    
    const response = await fetch('/api/GovMetricAPI/GetOrders', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Response error text:', errorText);
      } catch (textError) {
        console.error('Could not read error response text:', textError);
        errorText = 'Unable to read error details';
      }
      
      // If we get an HTML response, it means the API endpoint is not available
      if (errorText.includes('<!DOCTYPE') || errorText.includes('<html>')) {
        console.warn('API endpoint returned HTML instead of JSON, using mock data');
        return generateMockOrders();
      }
      
      // Try to parse as JSON for more detailed error info
      let errorDetails = '';
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorJson.detail || errorText;
      } catch {
        errorDetails = errorText;
      }
      
      throw new Error(`HTTP error! status: ${response.status} (${response.statusText}), message: ${errorDetails}`);
    }
    
    // Check if the response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.warn('API endpoint returned HTML instead of JSON, using mock data');
      return generateMockOrders();
    }
    
    const responseText = await response.text();
    console.log('Raw response text:', responseText.substring(0, 200) + '...');
    
    // Check if response starts with HTML
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html>')) {
      console.warn('API endpoint returned HTML instead of JSON, using mock data');
      return generateMockOrders();
    }
    
    let data: GovOrderResponse[];
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text that failed to parse:', responseText.substring(0, 500));
      console.warn('Using mock data due to JSON parse error');
      return generateMockOrders();
    }
    
    console.log('API response data:', data);
    
    // Validate that data is an array
    if (!Array.isArray(data)) {
      console.warn('API response is not an array, using mock data');
      return generateMockOrders();
    }
    
    // Transform the API response to match the frontend format
    const transformedData = data.map(transformGovOrderToOrder);
    console.log('Transformed data:', transformedData);
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.warn('Falling back to mock data due to API error');
    return generateMockOrders();
  }
}; 
