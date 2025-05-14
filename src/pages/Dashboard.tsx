
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockOrders } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { FileSearch, History, User } from 'lucide-react';

const Dashboard = () => {
  // Count orders by status
  const orderStats = mockOrders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  const totalOrders = mockOrders.length;

  return (
    <DashboardLayout>
      <h1 className="page-title">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
            <FileSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(orderStats.processing || 0) + (orderStats.shipped || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.delivered || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/orders" className="col-span-1">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <FileSearch className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">New Lien Search</h3>
              <p className="text-center text-muted-foreground mb-4">
                Request a new municipal lien search for a property
              </p>
              <Button>New Search</Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/history" className="col-span-1">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <History className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Search History</h3>
              <p className="text-center text-muted-foreground mb-4">
                View and track all your previous search requests
              </p>
              <Button variant="outline">View History</Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/profile" className="col-span-1">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your Profile</h3>
              <p className="text-center text-muted-foreground mb-4">
                Manage your company and contact information
              </p>
              <Button variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
