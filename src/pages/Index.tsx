
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 p-4">
      <div className="max-w-3xl text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <Package className="h-16 w-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          ParcelTrack Delivery System
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your one-stop solution for managing parcel deliveries with ease
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="/dashboard">Dashboard</Link>
          </Button>
          
          <Button asChild variant="outline" size="lg" className="rounded-full px-8">
            <Link to="/orders">Place New Order</Link>
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Easy Order Placement</h3>
            <p className="text-gray-600">
              Place orders with just a few clicks by providing address, parcel ID, and county information.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Order Tracking</h3>
            <p className="text-gray-600">
              Track your orders in real-time with comprehensive status updates and history.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Profile Management</h3>
            <p className="text-gray-600">
              Manage your personal information and delivery preferences in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
