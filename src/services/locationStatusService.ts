
export interface LocationStatus {
  isAvailable: boolean;
  alertMessage?: string;
  type: 'county' | 'municipality';
}

// Mock data matching the structure from CountiesCitiesConfig
const mockCountiesData = [
  {
    id: '1',
    name: 'Miami-Dade',
    state: 'FL',
    status: 'active' as const,
    municipalities: [
      {
        id: '1',
        name: 'Miami',
        countyId: '1',
        status: 'active' as const,
        availableServices: { code: true, permits: true, liens: true, utilities: true },
        reportTypes: ['full', 'card'] as const
      },
      {
        id: '2',
        name: 'Miami Beach',
        countyId: '1',
        status: 'unavailable' as const,
        alertMessage: 'System maintenance in progress',
        availableServices: { code: false, permits: false, liens: true, utilities: false },
        reportTypes: ['card'] as const
      }
    ]
  },
  {
    id: '2',
    name: 'Broward',
    state: 'FL',
    status: 'active' as const,
    municipalities: [
      {
        id: '3',
        name: 'Fort Lauderdale',
        countyId: '2',
        status: 'active' as const,
        availableServices: { code: true, permits: true, liens: true, utilities: true },
        reportTypes: ['full', 'card'] as const
      }
    ]
  }
];

export const checkLocationStatus = (municipality: string, county: string): LocationStatus => {
  console.log('Checking location status for:', { municipality, county });
  
  // Find the county
  const countyData = mockCountiesData.find(c => 
    c.name.toLowerCase().includes(county.toLowerCase()) ||
    county.toLowerCase().includes(c.name.toLowerCase())
  );
  
  if (!countyData) {
    console.log('County not found in data');
    return { isAvailable: true, type: 'county' };
  }
  
  // Check county status first
  if (countyData.status === 'unavailable') {
    console.log('County is unavailable:', countyData.alertMessage);
    return {
      isAvailable: false,
      alertMessage: countyData.alertMessage || 'This county is currently unavailable for orders.',
      type: 'county'
    };
  }
  
  // Find the municipality
  const municipalityData = countyData.municipalities.find(m =>
    m.name.toLowerCase().includes(municipality.toLowerCase()) ||
    municipality.toLowerCase().includes(m.name.toLowerCase())
  );
  
  if (!municipalityData) {
    console.log('Municipality not found in data');
    return { isAvailable: true, type: 'municipality' };
  }
  
  // Check municipality status
  if (municipalityData.status === 'unavailable') {
    console.log('Municipality is unavailable:', municipalityData.alertMessage);
    return {
      isAvailable: false,
      alertMessage: municipalityData.alertMessage || 'This municipality is currently unavailable for orders.',
      type: 'municipality'
    };
  }
  
  console.log('Location is available');
  return { isAvailable: true, type: 'municipality' };
};
