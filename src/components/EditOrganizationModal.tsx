import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Organization } from '@/services/orderService';

const editOrganizationSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationPlan: z.string().min(1, 'Plan is required'),
  organizationPlanStatus: z.string().min(1, 'Plan status is required'),
  organizationPlanMonthlyPrice: z.string().min(1, 'Monthly price is required'),
  organizationPlanMonthlyOrders: z.string().min(1, 'Monthly orders is required'),
});

type EditOrganizationForm = z.infer<typeof editOrganizationSchema>;

interface EditOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
  onOrganizationUpdated?: (updatedOrganization: Organization) => void;
}

const EditOrganizationModal = ({ open, onOpenChange, organization, onOrganizationUpdated }: EditOrganizationModalProps) => {
  const { toast } = useToast();
  
  const form = useForm<EditOrganizationForm>({
    resolver: zodResolver(editOrganizationSchema),
    defaultValues: {
      organizationName: '',
      organizationPlan: '',
      organizationPlanStatus: '',
      organizationPlanMonthlyPrice: '',
      organizationPlanMonthlyOrders: '',
    },
  });

  // Update form when organization changes
  useEffect(() => {
    if (organization && open) {
      form.reset({
        organizationName: organization.OrganizationName || '',
        organizationPlan: organization.OrganizationPlan || '',
        organizationPlanStatus: organization.OrganizationPlanStatus || '',
        organizationPlanMonthlyPrice: organization.OrganizationPlanMonthlyPrice || '',
        organizationPlanMonthlyOrders: organization.OrganizationPlanMonthlyOrders?.toString() || '',
      });
    }
  }, [organization, open, form]);

  const onSubmit = async (values: EditOrganizationForm) => {
    if (!organization) return;

    try {
      // TODO: Implement API call to update organization
      console.log('Updating organization:', values, 'for organization ID:', organization.OrganizationID);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create updated organization object
      const updatedOrganization: Organization = {
        ...organization,
        OrganizationName: values.organizationName,
        OrganizationPlan: values.organizationPlan,
        OrganizationPlanStatus: values.organizationPlanStatus,
        OrganizationPlanMonthlyPrice: values.organizationPlanMonthlyPrice,
        OrganizationPlanMonthlyOrders: parseInt(values.organizationPlanMonthlyOrders),
        // Recalculate remaining orders
        OrganizationPlanRemainingOrders: parseInt(values.organizationPlanMonthlyOrders) - (organization.OrganizationPlanUsedOrders || 0)
      };
      
      toast({
        title: "Organization Updated",
        description: `Successfully updated ${values.organizationName}`,
      });
      
      // Close modal and update parent component
      onOpenChange(false);
      onOrganizationUpdated?.(updatedOrganization);
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Failed to update organization. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update the organization information
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="organizationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter organization name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organizationPlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter plan name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="organizationPlanStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Status</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter plan status (e.g., Active, Inactive)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="organizationPlanMonthlyPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Price ($)</FormLabel>
                    <FormControl>
                      <Input placeholder="0.00" type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="organizationPlanMonthlyOrders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Orders</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Updating...' : 'Update Organization'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrganizationModal;