
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'failed' | 'failed-pa-site-down' | 'failed-code-site-down' | 'failed-permit-site-down' | 'failed-bad-address';
  createdAt: string;
  updatedAt: string;
  reportFileName?: string;
  reportFilePath?: string;
}

// Transform API response to frontend format
const transformGovOrderToOrder = (govOrder: GovOrderResponse): Order => {
  // Map status from API format to frontend format
  const statusMapping: Record<string, 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'failed' | 'failed-pa-site-down' | 'failed-code-site-down' | 'failed-permit-site-down' | 'failed-bad-address'> = {
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'IN_RESEARCH': 'shipped', // Maps to "In Research" which is "shipped" in the UI
    'COMPLETED': 'delivered',
    'CANCELED': 'canceled',
    'FAILED': 'failed',
    'FAILED_PA_SITE_DOWN': 'failed-pa-site-down',
    'FAILED_CODE_SITE_DOWN': 'failed-code-site-down',
    'FAILED_PERMIT_SITE_DOWN': 'failed-permit-site-down',
    'FAILED_BAD_ADDRESS': 'failed-bad-address'
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
    },
    {
      id: "GOV006",
      address: "987 Pine Ave, St. Petersburg, FL 33701",
      parcelId: "13-9876-000-0045",
      county: "Pinellas",
      status: "failed-pa-site-down",
      createdAt: "2024-01-10T14:00:00Z",
      updatedAt: "2024-01-10T14:30:00Z"
    },
    {
      id: "GOV007",
      address: "555 Oak St, Clearwater, FL 33755",
      parcelId: "14-5555-000-0067",
      county: "Pinellas",
      status: "failed-code-site-down",
      createdAt: "2024-01-09T12:00:00Z",
      updatedAt: "2024-01-09T12:45:00Z"
    },
    {
      id: "GOV008",
      address: "777 Maple Dr, Gainesville, FL 32601",
      parcelId: "15-7777-000-0123",
      county: "Alachua",
      status: "failed-permit-site-down",
      createdAt: "2024-01-08T10:30:00Z",
      updatedAt: "2024-01-08T11:00:00Z"
    },
    {
      id: "GOV009",
      address: "999 Invalid Address, Unknown, FL 99999",
      parcelId: "99-9999-000-0000",
      county: "Unknown",
      status: "failed-bad-address",
      createdAt: "2024-01-07T15:15:00Z",
      updatedAt: "2024-01-07T15:45:00Z"
    },
    {
      id: "GOV010",
      address: "111 Harbor Dr, Key West, FL 33040",
      parcelId: "17-1111-000-0001",
      county: "Monroe",
      status: "failed-pa-site-down",
      createdAt: "2024-01-06T08:00:00Z",
      updatedAt: "2024-01-06T08:30:00Z"
    },
    {
      id: "GOV011",
      address: "222 University Blvd, Tallahassee, FL 32301",
      parcelId: "20-2222-000-0002",
      county: "Leon",
      status: "failed-code-site-down",
      createdAt: "2024-01-05T14:20:00Z",
      updatedAt: "2024-01-05T14:50:00Z"
    },
    {
      id: "GOV012",
      address: "333 Colonial Dr, Fort Myers, FL 33901",
      parcelId: "21-3333-000-0003",
      county: "Lee",
      status: "failed-permit-site-down",
      createdAt: "2024-01-04T11:10:00Z",
      updatedAt: "2024-01-04T11:40:00Z"
    },
    {
      id: "GOV013",
      address: "444 Space Coast Pkwy, Cocoa Beach, FL 32931",
      parcelId: "22-4444-000-0004",
      county: "Brevard",
      status: "delivered",
      createdAt: "2024-01-03T16:30:00Z",
      updatedAt: "2024-01-04T09:15:00Z",
      reportFileName: "Municipal_Lien_Search_GOV013.pdf",
      reportFilePath: "Orders/Municipal_Lien_Search_GOV013.pdf"
    },
    {
      id: "GOV014",
      address: "555 International Dr, Orlando, FL 32819",
      parcelId: "18-5555-000-0005",
      county: "Orange",
      status: "processing",
      createdAt: "2024-01-02T13:45:00Z",
      updatedAt: "2024-01-02T13:45:00Z"
    },
    {
      id: "GOV015",
      address: "666 Las Olas Blvd, Fort Lauderdale, FL 33301",
      parcelId: "12-6666-000-0006",
      county: "Broward",
      status: "shipped",
      createdAt: "2024-01-01T10:00:00Z",
      updatedAt: "2024-01-02T08:20:00Z"
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
