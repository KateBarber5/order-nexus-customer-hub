
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, CheckCircle, MapPin } from 'lucide-react';

const Orders = () => {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [identifiedLocation, setIdentifiedLocation] = useState<{municipality: string, county: string} | null>(null);
  
  // Counties and their municipalities
  const countiesWithMunicipalities = {
    'Brevard': ['Melbourne', 'Titusville', 'Palm Bay', 'Cocoa', 'Rockledge'],
    'Broward': ['Fort Lauderdale', 'Hollywood', 'Pembroke Pines', 'Coral Springs', 'Sunrise'],
    'Columbia': ['Lake City', 'Fort White', 'High Springs'],
    'Duval': ['Jacksonville', 'Atlantic Beach', 'Neptune Beach', 'Jacksonville Beach'],
    'Escambia': ['Pensacola', 'Century'],
    'Hernando': ['Brooksville', 'Weeki Wachee'],
    'Highlands': ['Sebring', 'Avon Park', 'Lake Placid'],
    'Miami': ['Miami', 'Miami Beach', 'Coral Gables', 'Homestead', 'Hialeah'],
    'Okeechobee': ['Okeechobee'],
    'Orange': ['Orlando', 'Winter Park', 'Apopka', 'Winter Garden', 'Ocoee'],
    'Pasco': ['New Port Richey', 'Port Richey', 'Dade City', 'Zephyrhills'],
    'Santa Rosa': ['Milton', 'Gulf Breeze'],
    'Sarasota': ['Sarasota', 'North Port', 'Venice', 'Longboat Key'],
    'Seminole': ['Sanford', 'Altamonte Springs', 'Casselberry', 'Winter Springs'],
    'Volusia': ['Daytona Beach', 'Deltona', 'Ormond Beach', 'Port Orange', 'New Smyrna Beach'],
    'Wakulla': ['Sopchoppy', 'St. Marks']
  };

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

  const handleCountySelect = (county: string) => {
    setSelectedCounty(county);
    setSelectedMunicipality(null); // Reset municipality when county changes
  };

  const handleMunicipalitySelect = (municipality: string) => {
    setSelectedMunicipality(municipality);
  };

  const handleAddressLookup = (municipality: string, county: string) => {
    if (municipality && county) {
      setIdentifiedLocation({ municipality, county });
      setSelectedCounty(county);
      setSelectedMunicipality(municipality);
    } else {
      setIdentifiedLocation(null);
      setSelectedCounty(null);
      setSelectedMunicipality(null);
    }
  };

  // Use identified location or manually selected location
  const displayMunicipality = identifiedLocation?.municipality || selectedMunicipality;
  const displayCounty = identifiedLocation?.county || selectedCounty;
  const availableServices = getAvailableServices(displayMunicipality);

  // Check if any service supports Full Report or Card Report
  const hasFullReport = availableServices.some(service => service.fullReport);
  const hasCardReport = availableServices.some(service => service.cardReport);

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
        {/* Cities and Counties List */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-lg shadow h-[600px] flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium mb-2">Available Cities and Counties</h2>
              <p className="text-sm text-gray-600">Select an option below to view the available services</p>
              {identifiedLocation && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <MapPin size={16} />
                    <span className="font-medium">Auto-identified from address</span>
                  </div>
                </div>
              )}
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {Object.entries(countiesWithMunicipalities).map(([county, municipalities]) => (
                  <div key={county} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{county}</label>
                    <Select 
                      value={selectedCounty === county ? selectedMunicipality || '' : ''} 
                      onValueChange={(value) => {
                        handleCountySelect(county);
                        handleMunicipalitySelect(value);
                        setIdentifiedLocation(null); // Clear auto-identification when manually selecting
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select municipality" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities.map((municipality) => (
                          <SelectItem key={municipality} value={municipality}>
                            {municipality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Available Services Section */}
        {displayCounty && displayMunicipality && (
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4 h-[600px] flex flex-col">
              <div className="border-b pb-3 mb-4">
                <h2 className="text-lg font-medium mb-2">
                  Available Services - {displayMunicipality}, {displayCounty}
                </h2>
                {identifiedLocation && (
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <MapPin size={12} className="mr-1" />
                      Auto-identified
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  {hasFullReport && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Full Report Available
                    </span>
                  )}
                  {hasCardReport && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Card Report Available
                    </span>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1">
                <ul className="space-y-3">
                  {availableServices.map((service, index) => (
                    <li 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <CheckCircle size={16} className="text-green-500 mr-2" />
                        <span className="text-sm font-medium">{service.name}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>
          </div>
        )}
        
        {/* Order Form */}
        <div className={`w-full ${displayCounty && displayMunicipality ? 'lg:w-1/2' : 'lg:w-3/4'} transition-all duration-300`}>
          <OrderForm onAddressLookup={handleAddressLookup} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
