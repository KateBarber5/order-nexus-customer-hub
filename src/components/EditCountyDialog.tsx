
import React, { useEffect } from 'react';
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
import type { County, StatusType } from '@/pages/CountiesCitiesConfig';

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
  message: 'Alert message is required when status is "Currently Unavailable"',
  path: ['alertMessage'],
});

interface EditCountyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  county: County;
  onEdit: (county: { name: string; state: string; status: StatusType; alertMessage?: string }) => void;
}

const EditCountyDialog = ({ open, onOpenChange, county, onEdit }: EditCountyDialogProps) => {
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const countyData = {
      name: values.name,
      state: values.state,
      status: values.status,
      ...(values.status === 'unavailable' && values.alertMessage ? { alertMessage: values.alertMessage } : {}),
    };
    
    onEdit(countyData);
    onOpenChange(false);
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
                    <Input placeholder="e.g., Miami-Dade" {...field} />
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
                      <SelectItem value="unavailable">Currently Unavailable</SelectItem>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update County</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCountyDialog;
