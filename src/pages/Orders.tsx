
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';

const Orders = () => {
  return (
    <DashboardLayout>
      <h1 className="page-title">Place New Order</h1>
      <div className="max-w-2xl mx-auto">
        <OrderForm />
      </div>
    </DashboardLayout>
  );
};

export default Orders;
