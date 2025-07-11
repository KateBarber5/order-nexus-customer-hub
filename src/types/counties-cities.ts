
export interface Municipality {
  id: string;
  name: string;
  countyId: string;
  isActive: boolean;
  services: string[];
  alertMessage: string;
}

export interface County {
  id: string;
  name: string;
  municipalities: Municipality[];
}

export const AVAILABLE_SERVICES = [
  'Property Records',
  'Building Permits',
  'Code Violations',
  'Zoning Information',
  'Business Licenses',
  'Marriage Licenses',
  'Death Certificates',
  'Birth Certificates',
  'Voter Registration',
  'Property Tax Records'
];
