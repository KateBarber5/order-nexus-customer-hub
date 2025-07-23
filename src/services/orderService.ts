
// Types for CountiesCitiesConfig component
export type StatusType = 'active' | 'inactive' | 'unavailable';

export interface ServiceAvailability {
  code: boolean;
  permits: boolean;
  liens: boolean;
  utilities: boolean;
}

export type ReportType = 'full' | 'card';

export interface Municipality {
  id: string;
  name: string;
  countyId: string;
  status: StatusType;
  alertMessage?: string;
  availableServices: ServiceAvailability;
  reportTypes: ReportType[];
}

export interface County {
  id: string;
  name: string;
  state: string;
  status: StatusType;
  alertMessage?: string;
  municipalities: Municipality[];
}

// Report request response interface
export interface ReportRequestResponse {
  success?: boolean;
  message?: string;
  GovOrderID?: string;
  [key: string]: any; // Allow for additional properties
}

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

// Municipality availability check API response interface
export interface MunicipalityAvailabilityResponse {
  PlaceID: number;
  PlaceName: string;
  PlaceStatus: string;
  PlaceStatusMessage: string;
  SubPlace: {
    SubPlaceName: string;
    SubPlaceStatus: string;
    SubPlaceStatusMessage: string;
    Report: {
      SubPlaceOrderReportType: string;
    }[];
    Service: {
      PlaceService: string;
      PlaceServiceName: string;
    }[];
  }[];
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
    'Undefined': 'pending',
    'Processing': 'processing',
    'InResearch': 'shipped', // Maps to "In Research" which is "shipped" in the UI
    'Completed': 'delivered',
    'Canceled': 'canceled',
    'Failed': 'failed',
    'FailedPASiteDown': 'failed-pa-site-down',
    'FailedCodeSiteDown': 'failed-code-site-down',
    'FailedPermitSiteDown': 'failed-permit-site-down',
    'FailedBadAddress': 'failed-bad-address'
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
export const generateMockOrders = (): Order[] => {
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
      status: "failed-pa-site-down",
      createdAt: "2024-01-12T11:20:00Z",
      updatedAt: "2024-01-12T15:10:00Z"
    },
    {
      id: "GOV005",
      address: "654 Sunset Dr, Fort Lauderdale, FL 33301",
      parcelId: "12-5678-000-0089",
      county: "Broward",
      status: "failed-code-site-down",
      createdAt: "2024-01-11T13:00:00Z",
      updatedAt: "2024-01-11T14:30:00Z"
    },
    {
      id: "GOV006",
      address: "987 Pine Ave, St. Petersburg, FL 33701",
      parcelId: "13-9876-000-0045",
      county: "Pinellas",
      status: "failed-permit-site-down",
      createdAt: "2024-01-10T14:00:00Z",
      updatedAt: "2024-01-10T14:30:00Z"
    },
    {
      id: "GOV007",
      address: "555 Oak St, Clearwater, FL 33755",
      parcelId: "14-5555-000-0067",
      county: "Pinellas",
      status: "failed-bad-address",
      createdAt: "2024-01-09T12:00:00Z",
      updatedAt: "2024-01-09T12:45:00Z"
    },
    {
      id: "GOV008",
      address: "777 Maple Dr, Gainesville, FL 32601",
      parcelId: "15-7777-000-0123",
      county: "Alachua",
      status: "canceled",
      createdAt: "2024-01-08T10:30:00Z",
      updatedAt: "2024-01-08T11:00:00Z"
    },
    {
      id: "GOV009",
      address: "999 Invalid Address, Unknown, FL 99999",
      parcelId: "99-9999-000-0000",
      county: "Unknown",
      status: "failed",
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

// Fetch orders from the API only (no mock data mixing)
export const fetchOrdersFromAPI = async (): Promise<Order[]> => {
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
    
    // Check if the response is HTML instead of JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      throw new Error('API endpoint returned HTML instead of JSON');
    }
    
    const responseText = await response.text();
    console.log('Raw response text:', responseText.substring(0, 200) + '...');
    
    // Check if response starts with HTML
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html>')) {
      throw new Error('API endpoint returned HTML instead of JSON');
    }
    
    let data: GovOrderResponse[];
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Response text that failed to parse:', responseText.substring(0, 500));
      throw new Error('Failed to parse JSON response from API');
    }
    
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
    console.error('Error fetching orders from API:', error);
    throw error;
  }
};

// Fetch orders from the API with fallback to mock data
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    return await fetchOrdersFromAPI();
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.warn('Falling back to mock data due to API error');
    return generateMockOrders();
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
      console.error('API response is not an array:', data);
      throw new Error('API response is not an array');
    }
    
    // Validate each place has required properties
    const validPlaces = data.filter(place => {
      if (!place || typeof place !== 'object') {
        console.warn('Invalid place object:', place);
        return false;
      }
      if (!place.PlaceID || !place.PlaceName) {
        console.warn('Place missing required properties:', place);
        return false;
      }
      // SubPlace is optional - can be undefined, null, or empty array
      return true;
    });
    
    console.log('Valid places after filtering:', validPlaces);
    return validPlaces;
  } catch (error) {
    console.error('Error fetching places:', error);
    throw error;
  }
};

// Check municipality availability by parcel ID and county
export const checkMunicipalityAvailability = async (parcelId: string, countyName: string): Promise<MunicipalityAvailabilityResponse> => {
  try {
    console.log('Checking municipality availability...');
    console.log('Parcel ID:', parcelId);
    console.log('County Name:', countyName);
    
    const url = `/api/GovMetricAPI/CheckMunicipalityAvailabilityByParcel?iParcelID=${encodeURIComponent(parcelId)}&iCountyName=${encodeURIComponent(countyName)}`;
    console.log('API URL:', url);
    
    const response = await fetch(url, {
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
    
    const data: MunicipalityAvailabilityResponse = await response.json();
    console.log('Municipality availability response:', data);
    
    return data;
  } catch (error) {
    console.error('Error checking municipality availability:', error);
    throw error;
  }
};

// Check municipality availability by address
export const checkMunicipalityAvailabilityByAddress = async (address: string): Promise<MunicipalityAvailabilityResponse> => {
  try {
    console.log('Checking municipality availability by address...');
    console.log('Address:', address);
    
    const url = `/api/GovMetricAPI/CheckMunicipalityAvailabilityByAddress?iAddress=${encodeURIComponent(address)}`;
    console.log('API URL:', url);
    
    const response = await fetch(url, {
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
    
    const data: MunicipalityAvailabilityResponse = await response.json();
    console.log('Municipality availability by address response:', data);
    
    return data;
  } catch (error) {
    console.error('Error checking municipality availability by address:', error);
    throw error;
  }
};

// Global function to get organization and user data for testing
export const getOrganizationAndUserData = () => {
  return {
    iOrganizationID: 1,
    iUserGuid: "45a82190-4011-4fe9-aa5f-d2f2530eb34b"
  };
};

// CRUD County API interfaces
export interface CrudCountyRequest {
  iTrnMode: 'INS' | 'UPD' | 'DLT';
  iCountyName: string;
  iState: string;
  iCountyStatus: string;
  iAlertMessage?: string;
}

export interface CrudCountyMessage {
  Id: string;
  Type: number;
  Description: string;
}

export interface CrudCountyResponse {
  oMessages: CrudCountyMessage[];
  [key: string]: any;
}

export interface AvailableService {
  Name: string;
}

// CRUD Municipality interfaces
export interface CrudMunicipalityRequest {
  iTrnMode: 'INS' | 'UPD' | 'DLT';
  iCountyName: string;
  iSubPlace: {
    SubPlaceName: string;
    SubPlaceStatus: string;
    SubPlaceStatusMessage?: string;
    Report: {
      SubPlaceOrderReportType: string;
    }[];
    Service: {
      PlaceService: string;
    }[];
  };
}

export interface CrudMunicipalityMessage {
  Id: string;
  Type: number;
  Description: string;
}

export interface CrudMunicipalityResponse {
  oMessages: CrudMunicipalityMessage[];
  [key: string]: any;
}

// CRUD County API function
export const crudCounty = async (requestData: CrudCountyRequest): Promise<CrudCountyResponse> => {
  try {
    console.log('Submitting county CRUD request...');
    console.log('Request data:', requestData);
    
    const response = await fetch('/api/GovMetricAPI/CrudCounty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
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
    
    // Check if response has content
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    let data: CrudCountyResponse;
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('CRUD County response:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text that failed to parse:', responseText);
        // If it's not JSON but the request was successful, return a success response
        return { 
          oMessages: [{ 
            Id: 'Success', 
            Type: 2, 
            Description: responseText 
          }] 
        };
      }
    } else {
      // Empty response but successful status
      data = { 
        oMessages: [{ 
          Id: 'Success', 
          Type: 2, 
          Description: 'County operation completed successfully' 
        }] 
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error in CRUD County operation:', error);
    throw error;
  }
};

// CRUD Municipality API function
export const crudMunicipality = async (requestData: CrudMunicipalityRequest): Promise<CrudMunicipalityResponse> => {
  try {
    console.log('Submitting municipality CRUD request...');
    console.log('Request data:', requestData);
    
    const response = await fetch('/api/GovMetricAPI/CrudMunicipality', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
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
    
    // Check if response has content
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    let data: CrudMunicipalityResponse;
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('CRUD Municipality response:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text that failed to parse:', responseText);
        // If it's not JSON but the request was successful, return a success response
        return { 
          oMessages: [{ 
            Id: 'Success', 
            Type: 2, 
            Description: responseText 
          }] 
        };
      }
    } else {
      // Empty response but successful status
      data = { 
        oMessages: [{ 
          Id: 'Success', 
          Type: 2, 
          Description: 'Municipality operation completed successfully' 
        }] 
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error in CRUD Municipality operation:', error);
    throw error;
  }
};

// Transform API Place data to County/Municipality format for CountiesCitiesConfig
export const transformPlacesToCounties = (places: Place[]): County[] => {
  // Handle null/undefined input
  if (!places || !Array.isArray(places)) {
    console.warn('transformPlacesToCounties: Invalid input - places is not an array:', places);
    return [];
  }

  console.log(`Processing ${places.length} places from API`);
  
  return places.map(place => {
    console.log(`Processing place: ${place.PlaceName} (ID: ${place.PlaceID})`);
    console.log(`SubPlace: ${place.SubPlace ? `Array with ${place.SubPlace.length} items` : 'undefined/null'}`);
    // Map API status to component status
    const mapStatus = (apiStatus: string): StatusType => {
      switch (apiStatus.toLowerCase()) {
        case 'active':
        case 'available':
          return 'active';
        case 'inactive':
          return 'inactive';
        case 'unavailable':
          return 'unavailable';
        case 'down':
        case 'maintenance':
        case 'error':
          return 'unavailable';
        default:
          return 'inactive';
      }
    };

    // Transform services from API format to component format
    const transformServices = (services: PlaceService[]): ServiceAvailability => {
      const serviceMap: ServiceAvailability = {
        code: false,
        permits: false,
        liens: false,
        utilities: false
      };

      if (!services || !Array.isArray(services)) {
        console.warn('Invalid services array:', services);
        return serviceMap;
      }

      services.forEach(service => {
        if (!service || !service.PlaceServiceName) {
          console.warn('Invalid service object:', service);
          return;
        }
        
        const serviceName = service.PlaceServiceName.toLowerCase();
        if (serviceName.includes('code') || serviceName.includes('enforcement')) {
          serviceMap.code = true;
        }
        if (serviceName.includes('permit')) {
          serviceMap.permits = true;
        }
        if (serviceName.includes('lien') || serviceName.includes('municipal')) {
          serviceMap.liens = true;
        }
        if (serviceName.includes('utility') || serviceName.includes('utilities')) {
          serviceMap.utilities = true;
        }
      });

      return serviceMap;
    };

    // Transform report types from API format to component format
    const transformReportTypes = (reports: PlaceReport[]): ReportType[] => {
      const reportTypes: ReportType[] = [];
      
      if (!reports || !Array.isArray(reports)) {
        console.warn('Invalid reports array:', reports);
        return reportTypes;
      }
      
      reports.forEach(report => {
        if (!report || !report.SubPlaceOrderReportType) {
          console.warn('Invalid report object:', report);
          return;
        }
        
        if (report.SubPlaceOrderReportType === '1') {
          reportTypes.push('full');
        } else if (report.SubPlaceOrderReportType === '0') {
          reportTypes.push('card');
        }
      });

      return reportTypes;
    };

    // Handle counties with no municipalities (SubPlace can be undefined, null, or empty array)
    const municipalities: Municipality[] = [];
    
    if (place.SubPlace && Array.isArray(place.SubPlace) && place.SubPlace.length > 0) {
      console.log(`Processing ${place.SubPlace.length} municipalities for county "${place.PlaceName}"`);
      
      const mappedMunicipalities = place.SubPlace.map(subPlace => {
        // Validate subPlace has required properties
        if (!subPlace || !subPlace.SubPlaceName || !Array.isArray(subPlace.Service)) {
          console.warn('Invalid subPlace object:', subPlace);
          return null;
        }
        
        return {
          id: `${place.PlaceID}-${subPlace.SubPlaceName}`,
          name: subPlace.SubPlaceName,
          countyId: place.PlaceID.toString(),
          status: mapStatus(subPlace.SubPlaceStatus),
          alertMessage: subPlace.SubPlaceStatusMessage || undefined,
          availableServices: transformServices(subPlace.Service),
          reportTypes: transformReportTypes(subPlace.Report || [])
        };
      }).filter(Boolean) as Municipality[];
      
      municipalities.push(...mappedMunicipalities);
    } else {
      console.log(`County "${place.PlaceName}" has no municipalities (SubPlace is ${place.SubPlace ? 'empty array' : 'undefined/null'})`);
    }

    const county = {
      id: place.PlaceID.toString(),
      name: place.PlaceName,
      state: 'FL', // Assuming all places are in Florida
      status: mapStatus(place.PlaceStatus),
      alertMessage: place.PlaceStatusMessage || undefined,
      municipalities
    };
    
    console.log(`Created county: ${county.name} with ${county.municipalities.length} municipalities`);
    return county;
  });
};

// Submit report request by parcel
export const submitReportRequestByParcel = async (
  countyName: string, 
  parcelId: string, 
  reportType: 'full' | 'card'
): Promise<ReportRequestResponse> => {
  try {
    console.log('Submitting report request by parcel...');
    console.log('County Name:', countyName);
    console.log('Parcel ID:', parcelId);
    console.log('Report Type:', reportType);
    
    const { iOrganizationID, iUserGuid } = getOrganizationAndUserData();
    const iGovOrderReportType = reportType === 'full' ? "1" : "0";
    
    const requestBody = {
      iOrganizationID,
      iUserGuid,
      iCountyName: countyName,
      iGovOrderParcel: parcelId,
      iGovOrderReportType
    };
    
    console.log('Request body:', requestBody);
    
    const response = await fetch('/api/GovMetricAPI/PostReportRequestByParcel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
    
    // Check if response has content
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    let data: ReportRequestResponse;
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('Submit report request response:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text that failed to parse:', responseText);
        // If it's not JSON but the request was successful, return the text
        return { success: true, message: responseText };
      }
    } else {
      // Empty response but successful status
      data = { success: true, message: 'Order submitted successfully' };
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting report request:', error);
    throw error;
  }
};

// Fetch all available services from API
export const getAllAvailableServices = async (): Promise<AvailableService[]> => {
  try {
    console.log('Fetching all available services from API...');
    console.log('API URL:', '/api/GovMetricAPI/GetAllAvailableServices');
    
    const response = await fetch('/api/GovMetricAPI/GetAllAvailableServices', {
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
    
    const data: AvailableService[] = await response.json();
    console.log('API response data:', data);
    
    // Validate that data is an array
    if (!Array.isArray(data)) {
      console.error('API response is not an array:', data);
      throw new Error('API response is not an array');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching available services:', error);
    throw error;
  }
};

// Submit report request by address
export const submitReportRequestByAddress = async (
  address: string,
  countyName: string, 
  reportType: 'full' | 'card'
): Promise<ReportRequestResponse> => {
  try {
    console.log('Submitting report request by address...');
    console.log('Address:', address);
    console.log('County Name:', countyName);
    console.log('Report Type:', reportType);
    
    const { iOrganizationID, iUserGuid } = getOrganizationAndUserData();
    const iGovOrderReportType = reportType === 'full' ? "1" : "0";
    
    const requestBody = {
      iOrganizationID,
      iUserGuid,
      iGovOrderAddress: address,
      iCountyName: countyName,
      iGovOrderReportType
    };
    
    console.log('Request body:', requestBody);
    
    const response = await fetch('/api/GovMetricAPI/PostReportRequestByAddress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
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
    
    // Check if response has content
    const responseText = await response.text();
    console.log('Raw response text:', responseText);
    
    let data: ReportRequestResponse;
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('Submit report request by address response:', data);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        console.error('Response text that failed to parse:', responseText);
        // If it's not JSON but the request was successful, return the text
        return { success: true, message: responseText };
      }
    } else {
      // Empty response but successful status
      data = { success: true, message: 'Order submitted successfully' };
    }
    
    return data;
  } catch (error) {
    console.error('Error submitting report request by address:', error);
    throw error;
  }
};
