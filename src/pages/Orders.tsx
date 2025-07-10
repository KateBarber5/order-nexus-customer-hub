
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, MapPin, FileText, CreditCard } from 'lucide-react';

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
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <MapPin size={12} className="mr-1" />
                    Auto-identified
                  </span>
                </div>
                
                {/* Report Type Availability Cards */}
                <div className="grid grid-cols-1 gap-2 mb-3">
                  {hasFullReport && (
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-green-600" />
                          <div className="flex-1">
                            <div className="font-medium text-green-800">Full Report Available</div>
                            <div className="text-xs text-green-600">Complete detailed report with all available data</div>
                          </div>
                          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                            Premium
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {hasCardReport && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-blue-600" />
                          <div className="flex-1">
                            <div className="font-medium text-blue-800">Card Report Available</div>
                            <div className="text-xs text-blue-600">Summarized report with key information</div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                            Basic
                          </Badge>
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
              
              <ScrollArea className="flex-1">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Available Data Services:</h3>
                  {availableServices.map((service, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <CheckCircle size={16} className="text-green-500 mr-2" />
                            <span className="text-sm font-medium">{service.name}</span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 text-xs">
                          {service.fullReport ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                              <FileText size={10} className="mr-1" />
                              Full Report
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-300">
                              <FileText size={10} className="mr-1" />
                              Full Report N/A
                            </Badge>
                          )}
                          
                          {service.cardReport ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                              <CreditCard size={10} className="mr-1" />
                              Card Report
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-300">
                              <CreditCard size={10} className="mr-1" />
                              Card Report N/A
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
