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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Organization } from '@/services/orderService';

const editOrganizationSchema = z.object({
  organizationName: z.string().min(1, 'Organization name is required'),
  organizationAdmin: z.string().min(1, 'Organization admin is required'),
});

type EditOrganizationForm = z.infer<typeof editOrganizationSchema>;

interface EditOrganizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization | null;
  onOrganizationUpdated?: (updatedOrganization: Organization) => void;
  onEditSubscription?: (organizationId: number) => void;
}

const EditOrganizationModal = ({ open, onOpenChange, organization, onOrganizationUpdated, onEditSubscription }: EditOrganizationModalProps) => {
  const { toast } = useToast();
  
  const form = useForm<EditOrganizationForm>({
    resolver: zodResolver(editOrganizationSchema),
    defaultValues: {
      organizationName: '',
      organizationAdmin: '',
    },
  });

  // Update form when organization changes
  useEffect(() => {
    if (organization && open) {
      // Get the first user as default admin (in real implementation, you'd check for admin role)
      const defaultAdmin = organization.User && organization.User.length > 0 ? organization.User[0].UserGuid : '';
      
      form.reset({
        organizationName: organization.OrganizationName || '',
        organizationAdmin: defaultAdmin,
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
        // Note: In real implementation, you'd update the admin user assignment
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

  const handleEditSubscription = () => {
    if (organization) {
      onEditSubscription?.(organization.OrganizationID);
      handleClose();
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
              name="organizationAdmin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Admin</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select admin user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-background border z-50">
                      {organization?.User?.map((user) => (
                        <SelectItem 
                          key={user.UserGuid} 
                          value={user.UserGuid}
                          className="hover:bg-accent focus:bg-accent"
                        >
                          {user.UserName || 'Unnamed User'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={handleEditSubscription}>
                Edit Subscription Model
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