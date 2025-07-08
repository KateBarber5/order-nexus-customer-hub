
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save } from 'lucide-react';

interface SubscriptionData {
  id: string;
  clientName: string;
  subscriptionOption: string;
  monthlyPrice: number;
  monthlyOrders: number;
  remainingOrders: number;
  excessOrderCost: number;
}

const AdminSubscriptionsGrid = () => {
  const { toast } = useToast();
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<SubscriptionData>>({});
  
  // Mock subscription data
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([
    {
      id: '1',
      clientName: 'John Doe',
      subscriptionOption: 'Premium',
      monthlyPrice: 299,
      monthlyOrders: 50,
      remainingOrders: 35,
      excessOrderCost: 10
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      subscriptionOption: 'Standard',
      monthlyPrice: 199,
      monthlyOrders: 30,
      remainingOrders: 12,
      excessOrderCost: 10
    },
    {
      id: '3',
      clientName: 'Bob Johnson',
      subscriptionOption: 'Basic',
      monthlyPrice: 99,
      monthlyOrders: 15,
      remainingOrders: 8,
      excessOrderCost: 10
    },
    {
      id: '4',
      clientName: 'Alice Williams',
      subscriptionOption: 'Enterprise',
      monthlyPrice: 499,
      monthlyOrders: 100,
      remainingOrders: 75,
      excessOrderCost: 8
    }
  ]);

  const handleEdit = (id: string) => {
    const row = subscriptionData.find(item => item.id === id);
    if (row) {
      setEditingRow(id);
      setPendingChanges({
        monthlyOrders: row.monthlyOrders,
        remainingOrders: row.remainingOrders,
        excessOrderCost: row.excessOrderCost
      });
    }
  };

  const handleSave = () => {
    if (editingRow) {
      setSubscriptionData(prev => 
        prev.map(item => 
          item.id === editingRow 
            ? { ...item, ...pendingChanges }
            : item
        )
      );
      
      setEditingRow(null);
      setPendingChanges({});
      
      toast({
        title: "Changes Saved",
        description: "Subscription details have been updated successfully.",
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setPendingChanges({});
  };

  const handleInputChange = (field: keyof SubscriptionData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPendingChanges(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Subscriptions</CardTitle>
        <CardDescription>
          Manage client subscription details and pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client Name</TableHead>
              <TableHead>Subscription Option</TableHead>
              <TableHead>Monthly Price</TableHead>
              <TableHead>Monthly Orders</TableHead>
              <TableHead>Remaining Orders</TableHead>
              <TableHead>Excess Order Cost</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptionData.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.clientName}</TableCell>
                <TableCell>{row.subscriptionOption}</TableCell>
                <TableCell>${row.monthlyPrice}</TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      value={pendingChanges.monthlyOrders || row.monthlyOrders}
                      onChange={(e) => handleInputChange('monthlyOrders', e.target.value)}
                      className="w-20"
                    />
                  ) : (
                    row.monthlyOrders
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      value={pendingChanges.remainingOrders || row.remainingOrders}
                      onChange={(e) => handleInputChange('remainingOrders', e.target.value)}
                      className="w-20"
                    />
                  ) : (
                    row.remainingOrders
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={pendingChanges.excessOrderCost || row.excessOrderCost}
                      onChange={(e) => handleInputChange('excessOrderCost', e.target.value)}
                      className="w-20"
                    />
                  ) : (
                    `$${row.excessOrderCost}`
                  )}
                </TableCell>
                <TableCell>
                  {editingRow === row.id ? (
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="default">
                            <Save className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Changes</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to save these changes to {row.clientName}'s subscription?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSave}>
                              Save Changes
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(row.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminSubscriptionsGrid;
