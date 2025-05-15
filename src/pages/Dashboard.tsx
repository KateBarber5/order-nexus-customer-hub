
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockOrders } from '@/data/mockData';

const Dashboard = () => {
  // Count metrics
  const pendingOrders = mockOrders.filter(order => !order.status.includes('completed')).length;
  const completedOrders = mockOrders.filter(order => order.status.includes('completed')).length;
  const totalUsers = 12; // Mock user count
  
  // Recent completed orders - in a real app, would fetch from API
  const recentCompletedOrders = mockOrders
    .filter(order => order.status.includes('completed'))
    .sort((a, b) => {
      const dateA = a.statusDate ? new Date(a.statusDate).getTime() : 0;
      const dateB = b.statusDate ? new Date(b.statusDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <DashboardLayout>
      <h1 className="page-title">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <MetricCard 
          icon={<Clock className="h-8 w-8 text-orange-500" />} 
          title="Pending Orders" 
          value={pendingOrders.toString()}
          linkTo="/orders"
        />
        <MetricCard 
          icon={<CheckCircle className="h-8 w-8 text-green-500" />} 
          title="Completed Orders" 
          value={completedOrders.toString()}
          linkTo="/history"
        />
        <MetricCard 
          icon={<Users className="h-8 w-8 text-blue-500" />} 
          title="Total Users" 
          value={totalUsers.toString()}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                      <p className="font-medium">{order.property.address}</p>
                      <p className="text-sm text-muted-foreground">{order.statusDate}</p>
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
