
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { County } from '@/pages/CountiesCitiesConfig';

const formSchema = z.object({
  name: z.string().min(1, 'County name is required'),
  state: z.string().min(2, 'State is required').max(2, 'State must be 2 characters'),
});

interface EditCountyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  county: County;
  onEdit: (county: { name: string; state: string }) => void;
}

const EditCountyDialog = ({ open, onOpenChange, county, onEdit }: EditCountyDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: county.name,
      state: county.state,
    },
  });

  useEffect(() => {
    form.reset({
      name: county.name,
      state: county.state,
    });
  }, [county, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onEdit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
