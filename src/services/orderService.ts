

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

// GetPlaces API interfaces
export interface PlaceService {
  PlaceService: string;
  PlaceServiceName: string;
}

export interface PlaceReport {
  SubPlaceOrderReportType: string;
}

export interface SubPlace {
  SubPlaceName: string;
  SubPlaceStatus: string;
  SubPlaceStatusMessage: string;
  Service: PlaceService[];
  Report?: PlaceReport[];
}

export interface Place {
  PlaceID: number;
  PlaceName: string;
  PlaceStatus: string;
  PlaceStatusMessage: string;
  SubPlace: SubPlace[];
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
    
    const data: GovOrderResponse[] = await response.json();
    console.log('API response data:', data);
    
    // Validate that data is an array
    if (!Array.isArray(data)) {
      throw new Error('API response is not an array');
    }
    
    // Transform the API response to match the frontend format
    const transformedData = data.map(transformGovOrderToOrder);
    console.log('Transformed data:', transformedData);
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}; 

// Fetch places from the API
export const fetchPlaces = async (): Promise<Place[]> => {
  try {
    console.log('Fetching places from API...');
    console.log('API URL:', '/api/GovMetricAPI/GetPlaces');
    
    const response = await fetch('/api/GovMetricAPI/GetPlaces', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    
    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('Response error text:', errorText);
      } catch (textError) {
        console.error('Could not read error response text:', textError);
        errorText = 'Unable to read error details';
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
    
    const data: Place[] = await response.json();
    console.log('API response data:', data);
    
    // Validate that data is an array
    if (!Array.isArray(data)) {
      throw new Error('API response is not an array');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error;
  }
}; 