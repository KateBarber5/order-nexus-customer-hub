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
import { toast } from '@/components/ui/sonner';
import type { County, Municipality, ReportType, StatusType, CrudMunicipalityRequest } from '@/services/orderService';
import { crudMunicipality } from '@/services/orderService';

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
  message: 'Alert message is required when status is "Unavailable"',
  path: ['alertMessage'],
});

interface EditMunicipalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  municipality: Municipality;
  counties: County[];
  onEdit: (municipality: Omit<Municipality, 'id'>) => void;
}

const EditMunicipalityDialog = ({ open, onOpenChange, municipality, counties, onEdit }: EditMunicipalityDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: municipality.name,
      countyId: municipality.countyId,
      status: municipality.status,
      alertMessage: municipality.alertMessage || '',
      services: municipality.availableServices,
      reportTypes: municipality.reportTypes,
    },
  });

  useEffect(() => {
    if (open) {
      console.log('Dialog opened, resetting form with municipality data:', municipality);
      form.reset({
        name: municipality.name,
        countyId: municipality.countyId,
        status: municipality.status,
        alertMessage: municipality.alertMessage || '',
        services: municipality.availableServices,
        reportTypes: municipality.reportTypes,
      });
    }
  }, [municipality, form, open]);

  const watchedStatus = form.watch('status');
  const watchedReportTypes = form.watch('reportTypes');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    
    try {
      // Find the selected county to get its name
      const selectedCounty = counties.find(county => county.id === values.countyId);
      if (!selectedCounty) {
        toast.error('Selected county not found');
        return;
      }

      // Map status to API format
      const mapStatusToAPI = (status: string): string => {
        switch (status) {
          case 'active': return 'Active';
          case 'inactive': return 'Inactive';
          case 'unavailable': return 'Unavailable';
          default: return 'Active';
        }
      };

      // Build report types array
      const reports = values.reportTypes.map(reportType => ({
        SubPlaceOrderReportType: reportType === 'full' ? '1' : '0'
      }));

      // Build services array from checked services
      const services = Object.entries(values.services)
        .filter(([_, isChecked]) => isChecked)
        .map(([serviceKey, _]) => ({
          PlaceService: serviceKey.charAt(0).toUpperCase() + serviceKey.slice(1) // Capitalize first letter
        }));

      // Prepare the API request payload
      const requestData: CrudMunicipalityRequest = {
        iTrnMode: 'UPD',
        iCountyName: selectedCounty.name,
        iSubPlace: {
          SubPlaceName: values.name,
          SubPlaceStatus: mapStatusToAPI(values.status),
          ...(values.status === 'unavailable' && values.alertMessage && {
            SubPlaceStatusMessage: values.alertMessage
          }),
          Report: reports,
          Service: services
        }
      };

      console.log('API request payload:', requestData);

      // Make the API call
      const response = await crudMunicipality(requestData);
      console.log('API response:', response);

      // Check for success
      const successMessage = response.oMessages?.find(msg => msg.Id === 'Success');
      if (successMessage) {
        toast.success('Municipality updated successfully');
        
        const municipalityData: Omit<Municipality, 'id'> = {
          name: values.name,
          countyId: values.countyId,
          status: values.status,
          availableServices: {
            code: values.services.code,
            permits: values.services.permits,
            liens: values.services.liens,
            utilities: values.services.utilities,
          },
          reportTypes: values.reportTypes as ReportType[],
        };

        // Always include alertMessage if it exists, regardless of status
        if (values.alertMessage !== undefined && values.alertMessage !== null) {
          municipalityData.alertMessage = values.alertMessage;
        }
        
        console.log('Municipality data being sent to parent:', municipalityData);
        onEdit(municipalityData);
        onOpenChange(false);
      } else {
        // Check for error messages
        const errorMessage = response.oMessages?.find(msg => msg.Id !== 'Success');
        if (errorMessage) {
          toast.error(`Failed to update municipality: ${errorMessage.Description}`);
        } else {
          toast.error('Failed to update municipality: Unknown error');
        }
      }
    } catch (error) {
      console.error('Error updating municipality:', error);
      toast.error('Failed to update municipality. Please try again.');
    }
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
          <DialogTitle>Edit Municipality</DialogTitle>
          <DialogDescription>
            Update the municipality information and configure its services.
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                  <Select onValueChange={field.onChange} value={field.value}>
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
                          Code
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
                          Permits
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
                          Liens
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
                    id="edit-full-report"
                    checked={watchedReportTypes?.includes('full') || false}
                    onCheckedChange={(checked) => handleReportTypeChange('full', !!checked)}
                  />
                  <FormLabel htmlFor="edit-full-report" className="text-sm font-normal">
                    Full Report
                  </FormLabel>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-card-report"
                    checked={watchedReportTypes?.includes('card') || false}
                    onCheckedChange={(checked) => handleReportTypeChange('card', !!checked)}
                  />
                  <FormLabel htmlFor="edit-card-report" className="text-sm font-normal">
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
              <Button type="submit">Update Municipality</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMunicipalityDialog;
