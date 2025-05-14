
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderHistory from '@/components/OrderHistory';

const History = () => {
  return (
    <DashboardLayout>
      <h1 className="page-title">Order History</h1>
      <OrderHistory />
    </DashboardLayout>
  );
};

export default History;
