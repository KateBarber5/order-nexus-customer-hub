import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, UserPlus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOrganizations, Organization } from '@/services/orderService';
import CreateUserModal from '@/components/CreateUserModal';
import EditOrganizationModal from '@/components/EditOrganizationModal';

interface OrganizationGridData {
  id: string;
  organizationId: number;
  name: string;
  plan: string;
  status: string;
  monthlyPrice: string;
  monthlyOrders: number;
  usedOrders: number;
  remainingOrders: number;
  nextBillingDate: string;
  userCount: number;
  isActive: boolean;
}

const OrganizationsGrid = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<OrganizationGridData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationGridData | null>(null);
  const [selectedOrgForEdit, setSelectedOrgForEdit] = useState<Organization | null>(null);
  const [fullOrganizationsData, setFullOrganizationsData] = useState<Organization[]>([]);

  // Fetch organizations data on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const organizationsData = await getOrganizations();
        
        // Store full organization data for editing
        setFullOrganizationsData(organizationsData);
        
        // Map API response to component data structure
        const mappedData: OrganizationGridData[] = organizationsData.map((org: Organization) => ({
          id: org.OrganizationID.toString(),
          organizationId: org.OrganizationID,
          name: org.OrganizationName,
          plan: org.OrganizationPlan,
          status: org.OrganizationPlanStatus,
          monthlyPrice: org.OrganizationPlanMonthlyPrice,
          monthlyOrders: org.OrganizationPlanMonthlyOrders,
          usedOrders: org.OrganizationPlanUsedOrders,
          remainingOrders: org.OrganizationPlanRemainingOrders,
          nextBillingDate: org.OrganizationPlanNextBillingDate,
          userCount: org.User ? org.User.length : 0,
          isActive: org.OrganizationPlanStatus.toLowerCase() === 'active'
        }));
        
        setOrganizations(mappedData);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
        toast({
          title: "Error",
          description: "Failed to load organizations data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [toast]);

  const handleActiveToggle = async (id: string, isActive: boolean) => {
    try {
      // Here you would implement the API call to toggle organization status
      // For now, we'll just update the local state
      setOrganizations(prev => 
        prev.map(org => 
          org.id === id 
            ? { ...org, isActive, status: isActive ? 'Active' : 'Inactive' }
            : org
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Organization has been ${isActive ? 'activated' : 'deactivated'}.`,
      });
    } catch (error) {
      console.error('Error updating organization status:', error);
      toast({
        title: "Error",
        description: "Failed to update organization status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (organization: OrganizationGridData) => {
    navigate(`/admin/organizations/${organization.organizationId}`);
  };

  const handleEdit = (organization: OrganizationGridData) => {
    // Find the full organization data for editing
    const fullOrgData = fullOrganizationsData.find(org => org.OrganizationID === organization.organizationId);
    if (fullOrgData) {
      setSelectedOrgForEdit(fullOrgData);
      setEditModalOpen(true);
    }
  };

  const handleAddUser = (organization: OrganizationGridData) => {
    setSelectedOrganization(organization);
    setCreateUserModalOpen(true);
  };

  const handleOrganizationUpdated = (updatedOrganization: Organization) => {
    // Update both the full data and the grid data
    setFullOrganizationsData(prev => 
      prev.map(org => 
        org.OrganizationID === updatedOrganization.OrganizationID ? updatedOrganization : org
      )
    );
    
    setOrganizations(prev => 
      prev.map(org => 
        org.organizationId === updatedOrganization.OrganizationID 
          ? { ...org, name: updatedOrganization.OrganizationName }
          : org
      )
    );
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>
            Manage organizations and their settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading organizations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>
            Manage organizations and their settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading organizations data</p>
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
        <CardTitle>Organizations</CardTitle>
        <CardDescription>
          Manage organizations and their settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization Name</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Monthly Price</TableHead>
              <TableHead>Orders Used/Total</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>{org.plan}</TableCell>
                <TableCell>
                  {getStatusBadge(org.status, org.isActive)}
                </TableCell>
                <TableCell>${org.monthlyPrice}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {org.usedOrders}/{org.monthlyOrders}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {org.remainingOrders} remaining
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {org.userCount} user{org.userCount !== 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={org.isActive}
                    onCheckedChange={(checked) => handleActiveToggle(org.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleView(org)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(org)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAddUser(org)}
                      className="h-8 w-8 p-0"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {organizations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No organizations found
          </div>
        )}
      </CardContent>
      
      <CreateUserModal
        open={createUserModalOpen}
        onOpenChange={setCreateUserModalOpen}
        organizationName={selectedOrganization?.name || ''}
        organizationId={selectedOrganization?.organizationId || 0}
      />
      
      <EditOrganizationModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        organization={selectedOrgForEdit}
        onOrganizationUpdated={handleOrganizationUpdated}
      />
    </Card>
  );
};

export default OrganizationsGrid;