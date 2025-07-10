
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Package, CheckCircle, MapPin } from 'lucide-react';

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
        <div className={`w-full ${displayCounty && displayMunicipality ? 'lg:w-2/3' : 'lg:w-full'} transition-all duration-300`}>
          <OrderForm onAddressLookup={handleAddressLookup} />
        </div>
        
        {/* Available Services Section - Only show when municipality is identified */}
        {displayCounty && displayMunicipality && (
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow p-4 h-[600px] flex flex-col">
              <div className="border-b pb-3 mb-4">
                <h2 className="text-lg font-medium mb-2">
                  Available Services - {displayMunicipality}, {displayCounty}
                </h2>
                <div className="mb-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <MapPin size={12} className="mr-1" />
                    Auto-identified
                  </span>
                </div>
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
      </div>
    </DashboardLayout>
  );
};

export default Orders;
