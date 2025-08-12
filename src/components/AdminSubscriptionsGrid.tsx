
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Edit, Save, Loader2 } from 'lucide-react';
import { getOrganizations, Organization, updateOrganizationSubscription, OrganizationSubscriptionSDT } from '@/services/orderService';

interface SubscriptionData {
  id: string;
  organizationId: number; // Hidden field for OrganizationID
  clientName: string;
  subscriptionOption: string;
  monthlyPrice: string;
  monthlyOrders: number;
  remainingOrders: number;
  excessOrderCost: string;
}

const subscriptionOptions = ['Per Order', 'Retail', 'Enterprise', 'Custom'];

const subscriptionPricing = {
  'Per Order': { 
    monthlyPrice: '0.00', 
    monthlyOrders: 0, 
    excessOrderCost: '5.00',
    description: 'Pay per order processed' 
  },
  'Retail': { 
    monthlyPrice: '99.99', 
    monthlyOrders: 100, 
    excessOrderCost: '2.50',
    description: 'Standard retail pricing' 
  },
  'Enterprise': { 
    monthlyPrice: '299.99', 
    monthlyOrders: 500, 
    excessOrderCost: '1.50',
    description: 'Enterprise level pricing' 
  },
  'Custom': { 
    monthlyPrice: 'Custom', 
    monthlyOrders: 'Custom', 
    excessOrderCost: 'Custom',
    description: 'Custom pricing arrangement' 
  }
};

interface AdminSubscriptionsGridProps {
  autoEditOrganizationId?: number;
  onAutoEditComplete?: () => void;
}

const AdminSubscriptionsGrid = ({ autoEditOrganizationId, onAutoEditComplete }: AdminSubscriptionsGridProps = {}) => {
  const { toast } = useToast();
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [pendingChanges, setPendingChanges] = useState<Partial<SubscriptionData>>({});
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionChangeModal, setSubscriptionChangeModal] = useState<{
    open: boolean;
    organizationName: string;
    currentOption: string;
    newOption: string;
    rowId: string;
  }>({
    open: false,
    organizationName: '',
    currentOption: '',
    newOption: '',
    rowId: ''
  });

  // Fetch organizations data on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const organizations = await getOrganizations();
        
        // Map API response to component data structure
        const mappedData: SubscriptionData[] = organizations.map((org: Organization) => ({
          id: org.OrganizationID.toString(),
          organizationId: org.OrganizationID, // Add OrganizationID to the data
          clientName: org.OrganizationName,
          subscriptionOption: org.OrganizationPlan,
          monthlyPrice: org.OrganizationPlanMonthlyPrice,
          monthlyOrders: org.OrganizationPlanMonthlyOrders,
          remainingOrders: org.OrganizationPlanRemainingOrders,
          excessOrderCost: org.OrganizationPlanExcessOrderCost
        }));
        
        setSubscriptionData(mappedData);
        
        // Auto-edit if organizationId is provided
        if (autoEditOrganizationId) {
          const targetRow = mappedData.find(row => row.organizationId === autoEditOrganizationId);
          if (targetRow) {
            handleEdit(targetRow.id);
            onAutoEditComplete?.();
          }
        }
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
        toast({
          title: "Error",
          description: "Failed to load subscription data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [toast, autoEditOrganizationId, onAutoEditComplete]);

  const handleEdit = (id: string) => {
    const row = subscriptionData.find(item => item.id === id);
    if (row) {
      setEditingRow(id);
      setPendingChanges({
        subscriptionOption: row.subscriptionOption,
        monthlyOrders: row.monthlyOrders,
        remainingOrders: row.remainingOrders,
        excessOrderCost: row.excessOrderCost
      });
    }
  };

  const handleSave = async () => {
    if (editingRow) {
      try {
        // Find the current row data
        const currentRow = subscriptionData.find(item => item.id === editingRow);
        if (!currentRow) {
          throw new Error('Row data not found');
        }

        // Create the subscription data with the mapping
        const apiSubscriptionData: OrganizationSubscriptionSDT = {
          OrganizationID: currentRow.organizationId,
          OrganizationName: currentRow.clientName,
          OrganizationPlan: currentRow.subscriptionOption,
          OrganizationPlanMonthlyPrice: currentRow.monthlyPrice,
          OrganizationPlanMonthlyOrders: pendingChanges.monthlyOrders || currentRow.monthlyOrders,
          OrganizationPlanUsedOrders: pendingChanges.monthlyOrders - (pendingChanges.remainingOrders || currentRow.remainingOrders), // Calculate used orders
          OrganizationPlanRemainingOrders: pendingChanges.remainingOrders || currentRow.remainingOrders,
          OrganizationPlanExcessOrderCost: pendingChanges.excessOrderCost || currentRow.excessOrderCost,
          OrganizationPlanNextBillingDate: "", // This would need to come from the original data
          OrganizationPlanStatus: "" // This would need to come from the original data
        };

        // Call the API to update the subscription
        const response = await updateOrganizationSubscription(apiSubscriptionData);

        // Update local state with the changes
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
      } catch (error) {
        console.error('Error updating subscription:', error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to update subscription. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setPendingChanges({});
  };

  const handleInputChange = (field: keyof SubscriptionData, value: string) => {
    if (field === 'monthlyOrders' || field === 'remainingOrders') {
      const numValue = parseInt(value) || 0;
      setPendingChanges(prev => ({
        ...prev,
        [field]: numValue
      }));
    } else if (field === 'excessOrderCost') {
      setPendingChanges(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (field === 'subscriptionOption') {
      const currentRow = subscriptionData.find(item => item.id === editingRow);
      if (currentRow && value !== currentRow.subscriptionOption) {
        setSubscriptionChangeModal({
          open: true,
          organizationName: currentRow.clientName,
          currentOption: currentRow.subscriptionOption,
          newOption: value,
          rowId: editingRow!
        });
      } else {
        setPendingChanges(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
  };

  const handleSubscriptionChangeConfirm = () => {
    setPendingChanges(prev => ({
      ...prev,
      subscriptionOption: subscriptionChangeModal.newOption
    }));
    setSubscriptionChangeModal(prev => ({ ...prev, open: false }));
  };

  const handleSubscriptionChangeCancel = () => {
    setSubscriptionChangeModal(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Subscriptions</CardTitle>
          <CardDescription>
            Manage client subscription details and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading subscription data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Subscriptions</CardTitle>
          <CardDescription>
            Manage client subscription details and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading subscription data</p>
            <p className="text-sm text-gray-600">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Subscriptions</CardTitle>
        <CardDescription>
          Manage client subscription details and pricing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
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
                <TableCell>
                  {editingRow === row.id ? (
                    <Select
                      value={pendingChanges.subscriptionOption || row.subscriptionOption}
                      onValueChange={(value) => handleInputChange('subscriptionOption', value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {subscriptionOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    row.subscriptionOption
                  )}
                </TableCell>
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
                      type="text"
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
      
      <Dialog open={subscriptionChangeModal.open} onOpenChange={(open) => setSubscriptionChangeModal(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Subscription Change</DialogTitle>
            <DialogDescription>
              You are changing the subscription model for {subscriptionChangeModal.organizationName} from {subscriptionChangeModal.currentOption} to {subscriptionChangeModal.newOption}. The pricing differences are outlined below. Are you sure you want to change?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subscription Model</TableHead>
                  <TableHead>Monthly Price</TableHead>
                  <TableHead>Monthly Orders</TableHead>
                  <TableHead>Excess Order Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="bg-red-50">
                  <TableCell className="font-medium">
                    {subscriptionChangeModal.currentOption} (Current)
                  </TableCell>
                  <TableCell>
                    ${subscriptionPricing[subscriptionChangeModal.currentOption as keyof typeof subscriptionPricing]?.monthlyPrice || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {subscriptionPricing[subscriptionChangeModal.currentOption as keyof typeof subscriptionPricing]?.monthlyOrders || 'N/A'}
                  </TableCell>
                  <TableCell>
                    ${subscriptionPricing[subscriptionChangeModal.currentOption as keyof typeof subscriptionPricing]?.excessOrderCost || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow className="bg-green-50">
                  <TableCell className="font-medium">
                    {subscriptionChangeModal.newOption} (New)
                  </TableCell>
                  <TableCell>
                    ${subscriptionPricing[subscriptionChangeModal.newOption as keyof typeof subscriptionPricing]?.monthlyPrice || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {subscriptionPricing[subscriptionChangeModal.newOption as keyof typeof subscriptionPricing]?.monthlyOrders || 'N/A'}
                  </TableCell>
                  <TableCell>
                    ${subscriptionPricing[subscriptionChangeModal.newOption as keyof typeof subscriptionPricing]?.excessOrderCost || 'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleSubscriptionChangeCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubscriptionChangeConfirm}>
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminSubscriptionsGrid;
