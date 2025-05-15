import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { useToast } from "@/components/ui/use-toast"

interface Order {
  id: number;
  date: string;
  address: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const { toast } = useToast()

  useEffect(() => {
    // Mock data for demonstration
    const mockOrders: Order[] = [
      { id: 1, date: '2024-01-20', address: '123 Main St, Anytown', status: 'completed' },
      { id: 2, date: '2024-01-22', address: '456 Elm St, Anytown', status: 'processing' },
      { id: 3, date: '2024-01-25', address: '789 Oak St, Anytown', status: 'pending' },
    ];
    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
  }, []);

  useEffect(() => {
    const results = orders.filter(order =>
      order.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(results);
  }, [searchQuery, orders]);

  const handleViewDetails = (id: number) => {
    toast({
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with your request.",
      variant: "destructive",
    })
    console.log(`View details for order ID: ${id}`);
    // Implement navigation to order details page here
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <DashboardLayout>
      <div className="page-title">Dashboard</div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Here's a list of your recent orders. You can search by address.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Search by address..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.address}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => handleViewDetails(order.id)}>View Details</Button>
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

export default Dashboard;
