
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, CheckCircle } from 'lucide-react';

const Orders = () => {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  
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

  // Default services available for all municipalities
  const availableServices = [
    'Code',
    'Permits',
    'Liens',
    'Utilities'
  ];

  const handleCountySelect = (county: string) => {
    setSelectedCounty(county);
    setSelectedMunicipality(null); // Reset municipality when county changes
  };

  const handleMunicipalitySelect = (municipality: string) => {
    setSelectedMunicipality(municipality);
  };

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
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-2 border-b pb-2">Available Cities and Counties</h2>
            <p className="text-sm text-gray-600 mb-3">Select an option below to view the available services</p>
            <div className="space-y-4">
              {Object.entries(countiesWithMunicipalities).map(([county, municipalities]) => (
                <div key={county} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{county}</label>
                  <Select 
                    value={selectedCounty === county ? selectedMunicipality || '' : ''} 
                    onValueChange={(value) => {
                      handleCountySelect(county);
                      handleMunicipalitySelect(value);
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
          </div>
        </div>

        {/* Available Services Section */}
        {selectedCounty && selectedMunicipality && (
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-3 border-b pb-2">
                Available Services - {selectedMunicipality}, {selectedCounty}
              </h2>
              <div className="max-h-[500px] overflow-y-auto">
                <ul className="space-y-2">
                  {availableServices.map((service, index) => (
                    <li 
                      key={index} 
                      className="flex items-center px-2 py-2 hover:bg-gray-50 rounded cursor-pointer text-sm border border-gray-200 transition-colors"
                    >
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Order Form */}
        <div className={`w-full ${selectedCounty && selectedMunicipality ? 'lg:w-1/2' : 'lg:w-3/4'} transition-all duration-300`}>
          <OrderForm />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
