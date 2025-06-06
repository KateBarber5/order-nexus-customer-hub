
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { Package, CheckCircle } from 'lucide-react';

const Orders = () => {
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  
  // Updated list of municipalities that can be ordered
  const municipalities = [
    'Brevard',
    'Broward',
    'Columbia',
    'Duval',
    'Escambia',
    'Hernando',
    'Highlands',
    'Miami',
    'Okeechobee',
    'Orange',
    'Pasco',
    'Santa Rosa',
    'Sarasota',
    'Seminole',
    'Volusia',
    'Wakulla'
  ];

  // Default services available for all municipalities
  const availableServices = [
    'Code',
    'Permits',
    'Liens',
    'Utilities'
  ];

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
            <h2 className="text-lg font-medium mb-3 border-b pb-2">Available Cities and Counties</h2>
            <div className="max-h-[500px] overflow-y-auto">
              <ul className="space-y-1">
                {municipalities.map((municipality, index) => (
                  <li 
                    key={index} 
                    className={`px-2 py-1 hover:bg-gray-100 rounded cursor-pointer text-sm transition-colors ${
                      selectedMunicipality === municipality ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => handleMunicipalitySelect(municipality)}
                  >
                    {municipality}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Available Services Section */}
        {selectedMunicipality && (
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-3 border-b pb-2">
                Available Services - {selectedMunicipality}
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
        <div className={`w-full ${selectedMunicipality ? 'lg:w-1/2' : 'lg:w-3/4'} transition-all duration-300`}>
          <OrderForm />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
