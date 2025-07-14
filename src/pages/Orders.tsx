import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, MapPin, FileText, CreditCard, Building, Shield, Gavel, FileSpreadsheet, Receipt, AlertTriangle } from 'lucide-react';
import { checkLocationStatus } from '@/services/locationStatusService';

const Orders = () => {
  const [identifiedLocation, setIdentifiedLocation] = useState<{municipality: string, county: string} | null>(null);
  
  // Get services based on selected municipality - some municipalities don't offer Full Report
  const getAvailableServices = (municipality: string | null) => {
    if (!municipality) return [];
    
    // Municipalities that only offer Card Report (no Full Report)
    const cardReportOnlyMunicipalities = [
      'Titusville', 'Palm Bay', 'Cocoa', 'Hollywood', 'Fort White', 
      'Atlantic Beach', 'Century', 'Weeki Wachee', 'Lake Placid',
      'Miami Beach', 'Port Richey', 'Gulf Breeze', 'Longboat Key',
      'Casselberry', 'Deltona', 'New Smyrna Beach', 'St. Marks'
    ];
    
    const isCardReportOnly = cardReportOnlyMunicipalities.includes(municipality);
    
    return [
      { name: 'Code', fullReport: !isCardReportOnly, cardReport: false },
      { name: 'Permits', fullReport: !isCardReportOnly, cardReport: false },
      { name: 'Liens', fullReport: !isCardReportOnly, cardReport: true },
      { name: 'Utilities', fullReport: !isCardReportOnly, cardReport: false }
    ];
  };

  // Check if municipality is serviced - this should match the logic in OrderForm.tsx
  const isMunicipalityServiced = (municipality: string) => {
    const servicedMunicipalities = [
      // Full service municipalities (both Full Report and Card Report)
      'Miami', 'Coral Gables', 'Homestead', 'Aventura',
      'Fort Lauderdale', 'Pembroke Pines', 'Coral Springs', 'Miramar',
      'West Palm Beach', 'Boca Raton', 'Delray Beach', 'Boynton Beach', 'Wellington',
      'Orlando', 'Winter Park', 'Apopka', 'Ocoee', 'Winter Garden',
      'Tampa', 'Temple Terrace', 'Plant City', 'Oldsmar', 'Lutz',
      'St. Petersburg', 'Clearwater', 'Largo', 'Pinellas Park', 'Dunedin',
      'Jacksonville', 'Neptune Beach', 'Jacksonville Beach', 'Baldwin',
      'Fort Myers', 'Cape Coral', 'Bonita Springs', 'Estero', 'Sanibel',
      'Lakeland', 'Winter Haven', 'Bartow', 'Auburndale', 'Lake Wales',
      'Melbourne', 'Rockledge',
      
      // Card Report only municipalities
      'Titusville', 'Palm Bay', 'Cocoa', 'Hollywood', 'Fort White', 
      'Atlantic Beach', 'Century', 'Weeki Wachee', 'Lake Placid',
      'Miami Beach', 'Port Richey', 'Gulf Breeze', 'Longboat Key',
      'Casselberry', 'Deltona', 'New Smyrna Beach', 'St. Marks'
    ];
    return servicedMunicipalities.includes(municipality);
  };

  const handleAddressLookup = (municipality: string, county: string) => {
    if (municipality && county) {
      setIdentifiedLocation({ municipality, county });
    } else {
      setIdentifiedLocation(null);
    }
  };

  // Use identified location
  const displayMunicipality = identifiedLocation?.municipality;
  const displayCounty = identifiedLocation?.county;
  const availableServices = getAvailableServices(displayMunicipality);

  // Check if any service supports Full Report or Card Report
  const hasFullReport = availableServices.some(service => service.fullReport);
  const hasCardReport = availableServices.some(service => service.cardReport);

  // Define data services for each product type
  const fullReportServices = [
    { name: 'Code', icon: Building },
    { name: 'Permits', icon: Shield },
    { name: 'Liens', icon: Gavel }
  ];

  const cardReportServices = [
    { name: 'Property Appraiser Sheet', icon: FileSpreadsheet },
    { name: 'Tax Records', icon: Receipt }
  ];

  // Check if we should show the Available Services section
  const shouldShowAvailableServices = displayCounty && displayMunicipality && isMunicipalityServiced(displayMunicipality);

  // Check if there's a location alert to display
  const locationStatus = displayMunicipality && displayCounty ? checkLocationStatus(displayMunicipality, displayCounty) : null;
  const shouldShowLocationAlert = shouldShowAvailableServices && locationStatus && !locationStatus.isAvailable;

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="page-title">Place New Order</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Package size={18} />
          Bulk Order Placement
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        {/* Order Form */}
        <div className={`w-full ${shouldShowAvailableServices ? 'lg:w-2/3' : 'lg:w-full'} transition-all duration-300`}>
          <OrderForm onAddressLookup={handleAddressLookup} />
        </div>
        
        {/* Available Services Section - Only show when municipality is identified AND serviced */}
        {shouldShowAvailableServices && (
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-4 h-fit">
              <div className="border-b pb-3 mb-4">
                <h2 className="text-lg font-medium mb-2">
                  Available Services - {displayMunicipality}, {displayCounty}
                </h2>
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <MapPin size={12} className="mr-1" />
                    Auto-identified
                  </span>
                </div>

                {/* Location Alert Section */}
                {shouldShowLocationAlert && (
                  <Card className="border-amber-200 bg-amber-50 mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="font-semibold text-amber-800 text-sm mb-1">Site Maintenance Notice</div>
                          <div className="text-xs text-amber-700 leading-relaxed">
                            {locationStatus?.alertMessage}
                          </div>
                          <div className="mt-2 text-xs text-amber-600">
                            <strong>Type:</strong> {locationStatus?.type === 'county' ? 'County' : 'Municipality'} maintenance
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Report Type Availability Cards */}
                <div className="grid grid-cols-1 gap-3">
                  {hasFullReport && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText size={20} className="text-green-600" />
                          <div className="flex-1">
                            <div className="font-semibold text-green-800 text-base">Full Report Available</div>
                            <div className="text-xs text-green-600">Complete detailed report with all available data</div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                            Premium
                          </Badge>
                        </div>
                        
                        {/* Full Report Data Services */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-green-700 mb-2">Included Data Services:</div>
                          {fullReportServices.map((service, index) => {
                            const IconComponent = service.icon;
                            return (
                              <div key={index} className="flex items-center gap-2 text-xs text-green-700">
                                <IconComponent size={12} />
                                <span>{service.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {hasCardReport && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard size={20} className="text-blue-600" />
                          <div className="flex-1">
                            <div className="font-semibold text-blue-800 text-base">Card Report Available</div>
                            <div className="text-xs text-blue-600">Summarized report with key information</div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                            Basic
                          </Badge>
                        </div>
                        
                        {/* Card Report Data Services */}
                        <div className="space-y-2">
                          <div className="text-xs font-medium text-blue-700 mb-2">Included Data Services:</div>
                          {cardReportServices.map((service, index) => {
                            const IconComponent = service.icon;
                            return (
                              <div key={index} className="flex items-center gap-2 text-xs text-blue-700">
                                <IconComponent size={12} />
                                <span>{service.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {!hasFullReport && !hasCardReport && (
                    <Card className="border-gray-200 bg-gray-50">
                      <CardContent className="p-3">
                        <div className="text-center text-gray-600 text-sm">
                          No report options available for this municipality
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
