import React from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import type { County, Municipality, ServiceAvailability, ReportType, StatusType } from '@/pages/CountiesCitiesConfig';

const formSchema = z.object({
  name: z.string().min(1, 'Municipality name is required'),
  countyId: z.string().min(1, 'County selection is required'),
  status: z.enum(['active', 'inactive', 'unavailable'] as const),
  alertMessage: z.string().optional(),
  services: z.object({
    code: z.boolean(),
    permits: z.boolean(),
    liens: z.boolean(),
    utilities: z.boolean(),
  }),
  reportTypes: z.array(z.enum(['full', 'card'])).min(1, 'At least one report type is required'),
}).refine((data) => {
  if (data.status === 'unavailable' && (!data.alertMessage || data.alertMessage.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'Alert message is required when status is "Currently Unavailable"',
  path: ['alertMessage'],
});

interface AddMunicipalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counties: County[];
  onAdd: (municipality: Omit<Municipality, 'id'>) => void;
}

const AddMunicipalityDialog = ({ open, onOpenChange, counties, onAdd }: AddMunicipalityDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      countyId: '',
      status: 'active',
      alertMessage: '',
      services: {
        code: false,
        permits: false,
        liens: false,
        utilities: false,
      },
      reportTypes: [],
    },
  });

  const watchedStatus = form.watch('status');
  const watchedReportTypes = form.watch('reportTypes');

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const municipalityData: Omit<Municipality, 'id'> = {
      name: values.name,
      countyId: values.countyId,
      status: values.status,
      ...(values.status === 'unavailable' && values.alertMessage ? { alertMessage: values.alertMessage } : {}),
      availableServices: {
        code: values.services.code,
        permits: values.services.permits,
        liens: values.services.liens,
        utilities: values.services.utilities,
      },
      reportTypes: values.reportTypes as ReportType[],
    };
    
    onAdd(municipalityData);
    form.reset();
    onOpenChange(false);
  };

  const handleReportTypeChange = (reportType: ReportType, checked: boolean) => {
    const currentTypes = watchedReportTypes || [];
    if (checked) {
      form.setValue('reportTypes', [...currentTypes, reportType]);
    } else {
      form.setValue('reportTypes', currentTypes.filter(type => type !== reportType));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Municipality</DialogTitle>
          <DialogDescription>
            Add a new municipality and configure its available services and report types.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municipality Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Miami" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="countyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>County</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a county" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {counties.map((county) => (
                        <SelectItem key={county.id} value={county.id}>
                          {county.name} County, {county.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        placeholder="Enter the message that users will see when this municipality is unavailable..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="space-y-3">
              <FormLabel>Available Services</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="services.code"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Code Enforcement
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.permits"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Building Permits
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.liens"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Municipal Liens
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="services.utilities"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">
                          Utilities
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-3">
              <FormLabel>Report Types</FormLabel>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="full-report"
                    checked={watchedReportTypes?.includes('full') || false}
                    onCheckedChange={(checked) => handleReportTypeChange('full', !!checked)}
                  />
                  <FormLabel htmlFor="full-report" className="text-sm font-normal">
                    Full Report
                  </FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="card-report"
                    checked={watchedReportTypes?.includes('card') || false}
                    onCheckedChange={(checked) => handleReportTypeChange('card', !!checked)}
                  />
                  <FormLabel htmlFor="card-report" className="text-sm font-normal">
                    Card Report
                  </FormLabel>
                </div>
              </div>
              {form.formState.errors.reportTypes && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.reportTypes.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Municipality</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMunicipalityDialog;
