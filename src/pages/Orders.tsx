
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

const Orders = () => {
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

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h1 className="page-title">Place New Order</h1>
        <Button variant="outline" className="flex items-center gap-2">
          <Package size={18} />
          Bulk Order Placement
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
        {/* Municipalities List */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-3 border-b pb-2">Available Municipalities</h2>
            <div className="max-h-[500px] overflow-y-auto">
              <ul className="space-y-1">
                {municipalities.map((municipality, index) => (
                  <li 
                    key={index} 
                    className="px-2 py-1 hover:bg-gray-100 rounded cursor-pointer text-sm"
                  >
                    {municipality}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Order Form */}
        <div className="w-full md:w-2/3 lg:w-3/4">
          <OrderForm />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
