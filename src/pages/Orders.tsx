
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

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

  // Default services for all municipalities
  const defaultServices = ['Code', 'Permits', 'Liens', 'Utilities'];

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
      <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
        {/* Municipalities List */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-3 border-b pb-2">Available Cities and Counties</h2>
            <div className="max-h-[500px] overflow-y-auto">
              <ul className="space-y-1">
                {municipalities.map((municipality, index) => (
                  <li 
                    key={index} 
                    className={`px-2 py-1 hover:bg-gray-100 rounded cursor-pointer text-sm ${
                      selectedMunicipality === municipality ? 'bg-blue-100 border border-blue-300' : ''
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

        {/* Services List */}
        {selectedMunicipality && (
          <div className="w-full lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-3 border-b pb-2">
                Available Services - {selectedMunicipality}
              </h2>
              <div className="max-h-[500px] overflow-y-auto">
                <ul className="space-y-1">
                  {defaultServices.map((service, index) => (
                    <li 
                      key={index} 
                      className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer text-sm"
                    >
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Order Form */}
        <div className={`w-full ${selectedMunicipality ? 'lg:w-1/2' : 'lg:w-3/4'}`}>
          <OrderForm />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
