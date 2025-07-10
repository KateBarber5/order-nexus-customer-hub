
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle, MapPin, FileText, Shield, Zap, Building } from 'lucide-react';

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
      { 
        name: 'Code Violations',
        icon: Shield,
        description: 'Building code violations and enforcement actions',
        fullReport: !isCardReportOnly, 
        cardReport: false,
        price: isCardReportOnly ? null : '$15.00'
      },
      { 
        name: 'Building Permits',
        icon: Building,
        description: 'Active and historical building permit records',
        fullReport: !isCardReportOnly, 
        cardReport: false,
        price: isCardReportOnly ? null : '$12.00'
      },
      { 
        name: 'Municipal Liens',
        icon: FileText,
        description: 'Outstanding municipal liens and assessments',
        fullReport: !isCardReportOnly, 
        cardReport: true,
        price: '$10.00'
      },
      { 
        name: 'Utility Records',
        icon: Zap,
        description: 'Water, sewer, and utility connection history',
        fullReport: !isCardReportOnly, 
        cardReport: false,
        price: isCardReportOnly ? null : '$8.00'
      }
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
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg mb-2">
                  Available Products
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-green-600" />
                    <span className="text-sm font-medium">{displayMunicipality}, {displayCounty}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {hasFullReport && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Full Reports Available
                      </span>
                    )}
                    {hasCardReport && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Card Reports Available
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4">
                  <div className="space-y-3 py-4">
                    {availableServices.map((service, index) => {
                      const IconComponent = service.icon;
                      const isAvailable = service.fullReport || service.cardReport;
                      
                      return (
                        <div 
                          key={index} 
                          className={`border rounded-lg p-4 transition-colors ${
                            isAvailable 
                              ? 'border-gray-200 hover:bg-gray-50 hover:border-gray-300' 
                              : 'border-gray-100 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${
                              isAvailable ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <IconComponent size={16} className={
                                isAvailable ? 'text-blue-600' : 'text-gray-400'
                              } />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium text-sm ${
                                  isAvailable ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                  {service.name}
                                </h4>
                                {isAvailable ? (
                                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                                ) : (
                                  <span className="text-xs text-gray-400 flex-shrink-0">Not Available</span>
                                )}
                              </div>
                              <p className={`text-xs mb-2 ${
                                isAvailable ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                {service.description}
                              </p>
                              {isAvailable && service.price && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-green-600">
                                    {service.price}
                                  </span>
                                  <div className="flex gap-1">
                                    {service.fullReport && (
                                      <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">
                                        Full
                                      </span>
                                    )}
                                    {service.cardReport && (
                                      <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                        Card
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Orders;
