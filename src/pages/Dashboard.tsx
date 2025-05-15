
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockOrders } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { FileSearch, History, User, ArrowRight } from 'lucide-react';
import OrderCard from '@/components/OrderCard';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import StatusBadge from '@/components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
import OrderDetails from '@/components/OrderDetails';

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  
  // Count orders by status
  const orderStats = mockOrders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  const totalOrders = mockOrders.length;
  const recentOrders = [...mockOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 10);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const handleViewDetails = (orderId: number) => {
    setSelectedOrder(orderId);
  };
  
  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };
  
  const selectedOrderData = selectedOrder !== null 
    ? mockOrders.find(order => order.id === selectedOrder) 
    : null;

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
      
      <div className="mb-12">
        <Link to="/orders">
          <Button size="lg" className="w-full md:w-auto text-lg py-6 px-8 bg-green-600 hover:bg-green-700">
            Place New Order
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
      
      <h2 className="section-title mb-4">Recent Orders</h2>
      
      <div className="overflow-hidden rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Property Address</TableHead>
              <TableHead>County</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.address}</TableCell>
                  <TableCell>{order.county}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(order.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link to="/orders" className="col-span-1">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <FileSearch className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Place New Order</h3>
              <p className="text-center text-muted-foreground mb-4">
                Request a new municipal lien search for a property
              </p>
              <Button className="bg-green-600 hover:bg-green-700">New Search</Button>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/history" className="col-span-1">
          <Card className="h-full hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <History className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Order History</h3>
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
      
      {selectedOrderData && (
        <OrderDetails 
          order={selectedOrderData} 
          onClose={handleCloseDetails} 
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
