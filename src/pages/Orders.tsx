
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';

const Orders = () => {
  // List of municipalities that can be ordered
  const municipalities = [
    'Alachua',
    'Baker',
    'Bay',
    'Bradford',
    'Brevard',
    'Broward',
    'Calhoun',
    'Charlotte',
    'Citrus',
    'Clay',
    'Collier',
    'Columbia',
    'Miami-Dade',
    'Duval',
    'Escambia',
    'Flagler',
    'Franklin',
    'Gadsden',
    'Gilchrist',
    'Gulf',
    'Hamilton',
    'Hardee',
    'Hendry',
    'Hernando',
    'Highlands',
    'Hillsborough',
    'Holmes',
    'Indian River',
    'Jackson',
    'Jefferson',
    'Lafayette',
    'Lake',
    'Lee',
    'Leon',
    'Levy',
    'Liberty',
    'Madison',
    'Manatee',
    'Marion',
    'Martin',
    'Monroe',
    'Nassau',
    'Okaloosa',
    'Okeechobee',
    'Orange',
    'Osceola',
    'Palm Beach',
    'Pasco',
    'Pinellas',
    'Polk',
    'Putnam',
    'St. Johns',
    'St. Lucie',
    'Santa Rosa',
    'Sarasota',
    'Seminole',
    'Sumter',
    'Suwannee',
    'Taylor',
    'Union',
    'Volusia',
    'Wakulla',
    'Walton',
    'Washington'
  ];

  return (
    <DashboardLayout>
      <h1 className="page-title">Place New Order</h1>
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
