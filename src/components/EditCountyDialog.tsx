
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/sonner';
import type { County, StatusType } from '@/services/orderService';
import { crudCounty } from '@/services/orderService';

const formSchema = z.object({
  name: z.string().min(1, 'County name is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
  status: z.enum(['active', 'inactive', 'unavailable'] as const),
  alertMessage: z.string().optional(),
}).refine((data) => {
  if (data.status === 'unavailable' && (!data.alertMessage || data.alertMessage.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Alert message is required when status is "Unavailable"',
  path: ['alertMessage'],
});

interface EditCountyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  county: County;
  onEdit: (county: { name: string; state: string; status: StatusType; alertMessage?: string }) => void;
}

const EditCountyDialog = ({ open, onOpenChange, county, onEdit }: EditCountyDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: county.name,
      state: county.state,
      status: county.status,
      alertMessage: county.alertMessage || '',
    },
  });

  useEffect(() => {
    form.reset({
      name: county.name,
      state: county.state,
      status: county.status,
      alertMessage: county.alertMessage || '',
    });
  }, [county, form]);

  const watchedStatus = form.watch('status');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Map status to API format
      const mapStatusToAPI = (status: StatusType): string => {
        switch (status) {
          case 'active':
            return 'Active';
          case 'inactive':
            return 'Inactive';
          case 'unavailable':
            return 'Unavailable';
          default:
            return 'Active';
        }
      };

      const requestData = {
        iTrnMode: 'UPD' as const,
        iCountyName: values.name,
        iState: values.state,
        iCountyStatus: mapStatusToAPI(values.status),
        iAlertMessage: values.status === 'unavailable' && values.alertMessage ? values.alertMessage : undefined,
      };

      console.log('Submitting county update request:', requestData);
      
      const response = await crudCounty(requestData);
      
      // Check if the operation was successful by looking for "Success" in oMessages
      const successMessage = response.oMessages?.find(msg => msg.Id === 'Success');
      
      if (successMessage) {
        toast.success(successMessage.Description || `County "${values.name}" updated successfully`);
        
        // Call the onEdit callback with the form data for local state update
        const countyData = {
          name: values.name,
          state: values.state,
          status: values.status,
          ...(values.status === 'unavailable' && values.alertMessage ? { alertMessage: values.alertMessage } : {}),
        };
        
        onEdit(countyData);
        onOpenChange(false);
      } else {
        // Find error message if any
        const errorMessage = response.oMessages?.find(msg => msg.Id !== 'Success');
        const errorText = errorMessage?.Description || 'Failed to update county';
        toast.error(errorText);
      }
    } catch (error) {
      console.error('Error updating county:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update county');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit County</DialogTitle>
          <DialogDescription>
            Update the county information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Miami-Dade" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="FL" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchedStatus === 'unavailable' && (
              <FormField
                control={form.control}
                name="alertMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter the message that users will see when this county is unavailable..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating County...' : 'Update County'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCountyDialog;
