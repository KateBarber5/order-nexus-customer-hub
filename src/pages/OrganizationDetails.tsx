import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building, Calendar, CreditCard, Users, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getOrganizations, Organization } from '@/services/orderService';
import OrganizationOrderHistory from '@/components/OrganizationOrderHistory';
import OrganizationUsers from '@/components/OrganizationUsers';
import EditOrganizationModal from '@/components/EditOrganizationModal';

const OrganizationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrganization = async () => {
      if (!id) {
        setError('Organization ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const organizations = await getOrganizations();
        const foundOrg = organizations.find(org => org.OrganizationID.toString() === id);
        
        if (!foundOrg) {
          setError('Organization not found');
          toast({
            title: "Error",
            description: "Organization not found",
            variant: "destructive",
          });
          return;
        }
        
        setOrganization(foundOrg);
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch organization');
        toast({
          title: "Error",
          description: "Failed to load organization details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrganization();
  }, [id, toast]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center min-h-96">
            <span>Loading organization details...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !organization) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-destructive mb-4">Error loading organization details</p>
              {error && <p className="text-sm text-muted-foreground">{error}</p>}
              <Button onClick={() => navigate('/admin/organizations')} className="mt-4">
                Back to Organizations
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    const isActive = status.toLowerCase() === 'active';
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {status || 'Inactive'}
      </Badge>
    );
  };

  const handleEditOrganization = () => {
    setEditModalOpen(true);
  };

  const handleOrganizationUpdated = (updatedOrganization: Organization) => {
    setOrganization(updatedOrganization);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/organizations')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </Button>
        </div>

        {/* Organization Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{organization.OrganizationName}</CardTitle>
                  <CardDescription>Organization Details</CardDescription>
                </div>
              </div>
              <Button onClick={handleEditOrganization} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit Organization
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Plan</span>
                </div>
                <p className="text-lg">{organization.OrganizationPlan || 'Not specified'}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div>{getStatusBadge(organization.OrganizationPlanStatus)}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Monthly Price</span>
                </div>
                <p className="text-lg font-semibold">${organization.OrganizationPlanMonthlyPrice}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Users</span>
                </div>
                <p className="text-lg">{organization.User ? organization.User.length : 0}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Monthly Orders</span>
                <p className="text-lg">{organization.OrganizationPlanMonthlyOrders}</p>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Used Orders</span>
                <p className="text-lg">{organization.OrganizationPlanUsedOrders}</p>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Remaining Orders</span>
                <p className="text-lg">{organization.OrganizationPlanRemainingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="mt-6">
            <OrganizationOrderHistory organizationId={organization.OrganizationID} />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <OrganizationUsers 
              organizationId={organization.OrganizationID}
              organizationName={organization.OrganizationName}
              users={organization.User || []}
            />
          </TabsContent>
        </Tabs>

        {/* Edit Organization Modal */}
        <EditOrganizationModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          organization={organization}
          onOrganizationUpdated={handleOrganizationUpdated}
        />
      </div>
    </DashboardLayout>
  );
};

export default OrganizationDetails;