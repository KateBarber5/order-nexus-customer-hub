
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockOrders } from '@/data/mockData';
import { Activity, FileText, DollarSign, Clock } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  // Calculate dashboard metrics
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(order => order.status === 'pending').length;
  const completedOrders = mockOrders.filter(order => order.status === 'delivered').length;
  
  // Get recent orders (most recent 5)
  const recentOrders = [...mockOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  
  // Calculate average completion time (in days)
  const completedOrdersWithDuration = mockOrders
    .filter(order => order.status === 'delivered' && order.completedAt)
    .map(order => {
      const start = new Date(order.createdAt).getTime();
      const end = new Date(order.completedAt || Date.now()).getTime();
      return (end - start) / (1000 * 60 * 60 * 24); // convert to days
    });
  
  const averageCompletionTime = completedOrdersWithDuration.length > 0 
    ? completedOrdersWithDuration.reduce((sum, days) => sum + days, 0) / completedOrdersWithDuration.length
    : 0;
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Searches</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {pendingOrders} pending
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                {((completedOrders / totalOrders) * 100).toFixed(0)}% completion rate
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageCompletionTime.toFixed(1)} days</div>
              <p className="text-xs text-muted-foreground">
                Average search completion
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cost Saved</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,280</div>
              <p className="text-xs text-muted-foreground">
                Compared to traditional methods
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Orders */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Searches</CardTitle>
              <CardDescription>Your 5 most recent search requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">{order.address}</p>
                      <p className="text-sm text-muted-foreground">{order.county} County - {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={order.status} />
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* New Search CTA */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle>Need to run a new search?</CardTitle>
            <CardDescription className="text-primary-foreground/90">
              Submit a new municipal lien search request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary">
              <Link to="/orders">Start New Search</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
