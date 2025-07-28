import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, CheckCircle, Clock, X, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchOrdersFromAPI, Order } from '@/services/orderService';
import StatusBadge from '@/components/StatusBadge';
import OrderDetails from '@/components/OrderDetails';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders from API on component mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        console.log('Dashboard: Starting to fetch orders...');
        const fetchedOrders = await fetchOrdersFromAPI();
        console.log('Dashboard: Successfully fetched orders:', fetchedOrders);
        setOrders(fetchedOrders);
        setError(null);
      } catch (err) {
        console.error('Dashboard: Error loading orders:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);
  
  // Count metrics
  const failedOrders = orders.filter(order => order.status === 'failed').length;
  const processingOrders = orders.filter(order => order.status === 'processing').length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;
  const cancelledOrders = orders.filter(order => order.status === 'canceled').length;
  
  // Recent orders - get the last 10
  const recentOrders = [...orders]
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
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}



      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Dashboard</h1>
        <Button size="lg" variant="green" asChild className="gap-2">
          <Link to="/orders">
            <Plus className="h-5 w-5" />
            Place New Order
          </Link>
        </Button>
      </div>
      
      {!loading && (
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
            icon={<X className="h-8 w-8 text-red-500" />} 
            title="Failed Orders" 
            value={failedOrders.toString()}
            linkTo="/history?status=failed"
          />
          <MetricCard 
            icon={<X className="h-8 w-8 text-red-500" />} 
            title="Canceled Orders" 
            value={cancelledOrders.toString()}
            linkTo="/history?status=canceled"
          />
        </div>
      )}

      {loading && (
        <div className="text-center py-12 border rounded-lg bg-gray-50 mb-8">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading recent orders...</p>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Parcel ID</TableHead>
                  <TableHead>County</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono">{order.id}</TableCell>
                    <TableCell>{order.address}</TableCell>
                    <TableCell className="font-mono">{order.parcelId}</TableCell>
                    <TableCell>{order.county}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
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
          )}
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
