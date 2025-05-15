
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, CheckCircle, Clock, X, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockOrders } from '@/data/mockData';
import StatusBadge from '@/components/StatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const Dashboard = () => {
  // Count metrics
  const pendingOrders = mockOrders.filter(order => order.status === 'pending').length;
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

  // Recent completed orders for the card
  const recentCompletedOrders = mockOrders
    .filter(order => order.status === 'delivered')
    .sort((a, b) => {
      // Using optional chaining and nullish coalescing to avoid TypeScript errors
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Dashboard</h1>
        <Button size="lg" asChild className="gap-2">
          <Link to="/orders">
            <Plus className="h-5 w-5" />
            Place New Order
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <MetricCard 
          icon={<CheckCircle className="h-8 w-8 text-green-500" />} 
          title="Completed Orders" 
          value={completedOrders.toString()}
          linkTo="/history"
        />
        <MetricCard 
          icon={<Clock className="h-8 w-8 text-orange-500" />} 
          title="Pending Orders" 
          value={pendingOrders.toString()}
          linkTo="/orders"
        />
        <MetricCard 
          icon={<X className="h-8 w-8 text-red-500" />} 
          title="Cancelled Orders" 
          value={cancelledOrders.toString()}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Completed Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCompletedOrders.length > 0 ? (
                recentCompletedOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{order.address}</p>
                      <p className="text-sm text-muted-foreground">{order.updatedAt}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/history?id=${order.id}`}>View Details</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No completed orders yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button className="w-full justify-start" asChild>
                <Link to="/orders">
                  <FileText className="mr-2 h-4 w-4" />
                  Create New Order
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/history">
                  <Clock className="mr-2 h-4 w-4" />
                  View Order History
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link to="/profile">
                  <Users className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
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
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/history?id=${order.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
