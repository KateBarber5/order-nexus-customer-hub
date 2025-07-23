import React, { useState, useEffect } from 'react';
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
import type { County, Municipality, ServiceAvailability, ReportType, StatusType, AvailableService, CrudMunicipalityRequest } from '@/services/orderService';
import { getAllAvailableServices, crudMunicipality } from '@/services/orderService';

// Dynamic form schema based on available services
const createFormSchema = (availableServices: AvailableService[]) => {
  const servicesSchema: Record<string, z.ZodBoolean> = {};
  
  availableServices.forEach(service => {
    const serviceKey = service.Name.toLowerCase().replace(/\s+/g, '');
    servicesSchema[serviceKey] = z.boolean();
  });

  return z.object({
    name: z.string().min(1, 'Municipality name is required'),
    countyId: z.string().optional(),
    status: z.enum(['active', 'inactive', 'unavailable'] as const),
    alertMessage: z.string().optional(),
    services: z.object(servicesSchema),
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
};

interface AddMunicipalityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  counties: County[];
  selectedCounty?: County;
  onAdd: (municipality: Omit<Municipality, 'id'>) => void;
}

const AddMunicipalityDialog = ({ open, onOpenChange, counties, selectedCounty, onAdd }: AddMunicipalityDialogProps) => {
  const [availableServices, setAvailableServices] = useState<AvailableService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [servicesError, setServicesError] = useState<string | null>(null);

  // Fetch available services on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoadingServices(true);
        setServicesError(null);
        const services = await getAllAvailableServices();
        console.log('Loaded available services:', services);
        setAvailableServices(services);
      } catch (error) {
        console.error('Error loading available services:', error);
        setServicesError('Failed to load available services');
        toast.error('Failed to load available services');
      } finally {
        setLoadingServices(false);
      }
    };

    if (open) {
      loadServices();
    }
  }, [open]);

  // Create default values for services
  const createDefaultServices = () => {
    const defaultServices: Record<string, boolean> = {};
    availableServices.forEach(service => {
      const serviceKey = service.Name.toLowerCase().replace(/\s+/g, '');
      defaultServices[serviceKey] = false;
    });
    return defaultServices;
  };

  // Create dynamic form schema based on available services
  const formSchema = createFormSchema(availableServices);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      countyId: selectedCounty?.id || '',
      status: 'active',
      alertMessage: '',
      services: createDefaultServices(),
      reportTypes: [],
    },
  });

  // Reset form when services change to ensure proper field registration
  useEffect(() => {
    if (availableServices.length > 0) {
      const defaultServices = createDefaultServices();
      form.reset({
        name: form.getValues('name'),
        countyId: form.getValues('countyId'),
        status: form.getValues('status'),
        alertMessage: form.getValues('alertMessage'),
        services: defaultServices,
        reportTypes: form.getValues('reportTypes'),
      });
    }
  }, [availableServices, form]);

  // Don't render the form if services are still loading or if there's an error
  if (loadingServices || servicesError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Municipality</DialogTitle>
            <DialogDescription>
              {loadingServices ? 'Loading available services...' : 'Error loading services'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            {loadingServices ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading services...</span>
              </>
            ) : (
              <p className="text-sm text-destructive">{servicesError}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }



  const watchedStatus = form.watch('status');
  const watchedReportTypes = form.watch('reportTypes');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedCounty) {
      toast.error('No county selected');
      return;
    }

    console.log('Form values:', values);
    console.log('Services values:', values.services);

    try {
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
        .map(([serviceKey, _]) => {
          // Map the service key back to the original service name
          const service = availableServices.find(s => 
            s.Name.toLowerCase().replace(/\s+/g, '') === serviceKey
          );
          return {
            PlaceService: service ? service.Name : serviceKey
          };
        });

      // Prepare the API request payload
      const requestData: CrudMunicipalityRequest = {
        iTrnMode: 'INS',
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
        toast.success('Municipality added successfully');
        
        // Transform dynamic services to ServiceAvailability format for local state
        const availableServices: ServiceAvailability = {
          code: values.services.code || false,
          permits: values.services.permits || false,
          liens: values.services.liens || false,
          utilities: false, // Default to false since it's not in the API response
        };

        const municipalityData: Omit<Municipality, 'id'> = {
          name: values.name,
          countyId: selectedCounty.id,
          status: values.status,
          ...(values.status === 'unavailable' && values.alertMessage ? { alertMessage: values.alertMessage } : {}),
          availableServices,
          reportTypes: values.reportTypes as ReportType[],
        };
        
        onAdd(municipalityData);
        form.reset();
        onOpenChange(false);
      } else {
        // Check for error messages
        const errorMessage = response.oMessages?.find(msg => msg.Id !== 'Success');
        if (errorMessage) {
          toast.error(`Failed to add municipality: ${errorMessage.Description}`);
        } else {
          toast.error('Failed to add municipality: Unknown error');
        }
      }
    } catch (error) {
      console.error('Error adding municipality:', error);
      toast.error('Failed to add municipality. Please try again.');
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

  if (!selectedCounty) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Municipality</DialogTitle>
          <DialogDescription>
            Add a new municipality to {selectedCounty ? `${selectedCounty.name} County` : 'the selected county'} and configure its available services and report types.
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
                  <FormControl>
                    <Input 
                      value={selectedCounty ? `${selectedCounty.name} County, ${selectedCounty.state}` : ''}
                      readOnly
                      placeholder="County will be selected from map"
                    />
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
                {availableServices.map((service) => {
                  const serviceKey = service.Name.toLowerCase().replace(/\s+/g, '');
                  return (
                    <FormField
                      key={service.Name}
                      control={form.control}
                      name={`services.${serviceKey}` as any}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              {service.Name}
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  );
                })}
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
