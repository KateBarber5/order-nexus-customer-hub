
import React, { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, CheckCircle, Clock, X, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockOrders } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import OrderDetails from '@/components/OrderDetails';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Dashboard = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Count metrics
  const pendingOrders = mockOrders.filter(order => order.status === 'pending').length;
  const processingOrders = mockOrders.filter(order => order.status === 'processing').length;
  const completedOrders = mockOrders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = mockOrders.filter(order => order.status === 'cancelled').length;
  
  // Recent orders - get the last 10
  const recentOrders = [...mockOrders]
    .sort((a, b) => {
      // Using optional chaining and nullish coalescing to avoid TypeScript errors
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Dashboard</h1>
        <Button size="lg" variant="green" asChild className="gap-2">
          <Link to="/orders">
            <Plus className="h-5 w-5" />
            Place New Order
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
        <MetricCard 
          icon={<CheckCircle className="h-8 w-8 text-green-500" />} 
          title="Completed Orders" 
          value={completedOrders.toString()}
          linkTo="/history?status=delivered"
        />
        <MetricCard 
          icon={<RefreshCw className="h-8 w-8 text-blue-500" />} 
          title="Processing Orders" 
          value={processingOrders.toString()}
          linkTo="/history?status=processing"
        />
        <MetricCard 
          icon={<Clock className="h-8 w-8 text-orange-500" />} 
          title="Pending Orders" 
          value={pendingOrders.toString()}
          linkTo="/history?status=pending"
        />
        <MetricCard 
          icon={<X className="h-8 w-8 text-red-500" />} 
          title="Cancelled Orders" 
          value={cancelledOrders.toString()}
          linkTo="/history?status=cancelled"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.id}</TableCell>
                  <TableCell>{order.address}</TableCell>
                  <TableCell>{order.county}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewOrder(order)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedOrder && (
        <OrderDetails order={selectedOrder} onClose={handleCloseModal} />
      )}
    </DashboardLayout>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  linkTo?: string;
}

const MetricCard = ({ icon, title, value, linkTo }: MetricCardProps) => {
  const content = (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
  
  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }
  
  return content;
};

export default Dashboard;
