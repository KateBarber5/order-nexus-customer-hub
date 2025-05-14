
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrderForm from '@/components/OrderForm';

const Orders = () => {
  return (
    <DashboardLayout>
      <h1 className="page-title">Submit New Lien Search</h1>
      <div className="max-w-2xl mx-auto">
        <OrderForm />
      </div>
    </DashboardLayout>
  );
};

export default Orders;
