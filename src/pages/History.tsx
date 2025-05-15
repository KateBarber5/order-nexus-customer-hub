
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderHistory from '@/components/OrderHistory';

const History = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Order History</h1>
        <OrderHistory />
      </div>
    </DashboardLayout>
  );
};

export default History;
