import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { lookupAddress } from '@/services/smartyStreetsService';

interface OrderFormData {
  address: string;
  parcelId: string;
  county: string;
  productType: 'full' | 'card';
  searchType: 'address' | 'parcel';
  identifiedMunicipality?: string;
  identifiedCounty?: string;
}

interface OrderFormProps {
  onAddressLookup?: (municipality: string, county: string) => void;
}

const OrderForm = ({ onAddressLookup }: OrderFormProps) => {
  const [formData, setFormData] = useState<OrderFormData>({
    address: '',
    parcelId: '',
    county: '',
    productType: 'full',
    searchType: 'address'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'details' | 'review'>('details');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false);

  // Debounced address lookup
  useEffect(() => {
    if (formData.searchType === 'address' && formData.address.length > 10) {
      const timeoutId = setTimeout(async () => {
        setIsLookingUpAddress(true);
        try {
          const result = await lookupAddress(formData.address);
          if (result && result.isValid) {
            setFormData(prev => ({
              ...prev,
              identifiedMunicipality: result.municipality,
              identifiedCounty: result.county
            }));
            
            if (onAddressLookup) {
              onAddressLookup(result.municipality, result.county);
            }
            
            toast.success(`Address validated: ${result.municipality}, ${result.county}`);
          } else {
            setFormData(prev => ({
              ...prev,
              identifiedMunicipality: undefined,
              identifiedCounty: undefined
            }));
            
            if (onAddressLookup) {
              onAddressLookup('', '');
            }
          }
        } catch (error) {
          console.error('Address lookup failed:', error);
          toast.error('Failed to validate address');
        } finally {
          setIsLookingUpAddress(false);
        }
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.address, formData.searchType, onAddressLookup]);

  const isSearchCriteriaFilled = () => {
    if (formData.searchType === 'address') {
      return formData.address.trim() !== '';
    } else {
      return formData.parcelId.trim() !== '' && formData.county.trim() !== '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductTypeChange = (value: 'full' | 'card') => {
    if (isSearchCriteriaFilled()) {
      setFormData(prev => ({
        ...prev,
        productType: value
      }));
    }
  };

  const handleSearchTypeChange = (value: 'address' | 'parcel') => {
    setFormData(prev => ({
      ...prev,
      searchType: value,
      // Clear search fields when switching types
      address: '',
      parcelId: '',
      county: '',
      identifiedMunicipality: undefined,
      identifiedCounty: undefined
    }));
    
    if (onAddressLookup) {
      onAddressLookup('', '');
    }
  };

  const handleProceedToReview = () => {
    // Validation based on search type
    if (formData.searchType === 'address') {
      if (!formData.address) {
        toast.error('Please enter a property address');
        return;
      }
    } else {
      if (!formData.parcelId || !formData.county) {
        toast.error('Please enter both Parcel ID and County');
        return;
      }
    }
    
    setCurrentStep('review');
  };

  const handleBackToDetails = () => {
    setCurrentStep('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Order submitted:', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Show success message
      toast.success('Municipal lien search order submitted successfully!');
      
      // Reset after 3 seconds
      setTimeout(() => {
        // Reset form
        setFormData({
          address: '',
          parcelId: '',
          county: '',
          productType: 'full',
          searchType: 'address'
        });
        setCurrentStep('details');
        setIsSuccess(false);
        
        if (onAddressLookup) {
          onAddressLookup('', '');
        }
      }, 5000);
    }, 1500);
  };

  // Display success message screen
  if (isSuccess) {
    return (
      <Card className="text-center py-10">
        <CardContent className="pt-10">
          <div className="mx-auto rounded-full bg-green-100 p-6 w-16 h-16 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle className="text-2xl mb-4">Thank you for your order submission</CardTitle>
          <CardDescription className="text-lg max-w-md mx-auto mb-6">
            We'll notify you via email when your order is completed.
          </CardDescription>
          <div className="mt-8">
            <Button onClick={() => setIsSuccess(false)}>Return to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'review') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Your Order</CardTitle>
          <CardDescription>
            Please review your order details before submitting your order
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4 border rounded-md p-4 bg-gray-50">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-sm text-muted-foreground">Product Type</div>
                <div className="col-span-2 font-medium">
                  {formData.productType === 'full' ? 'Full Report' : 'Card Report'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 text-sm text-muted-foreground">Search Type</div>
                <div className="col-span-2 font-medium">
                  {formData.searchType === 'address' ? 'Property Address' : 'Parcel ID & County'}
                </div>
              </div>
              
              {formData.searchType === 'address' ? (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-sm text-muted-foreground">Property Address</div>
                    <div className="col-span-2 font-medium">{formData.address}</div>
                  </div>
                  
                  {formData.identifiedMunicipality && formData.identifiedCounty && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 text-sm text-muted-foreground">Identified Location</div>
                      <div className="col-span-2 font-medium text-green-600">
                        City: {formData.identifiedMunicipality}, County: {formData.identifiedCounty}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-sm text-muted-foreground">Parcel ID / Folio Number</div>
                    <div className="col-span-2 font-medium">{formData.parcelId}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1 text-sm text-muted-foreground">County</div>
                    <div className="col-span-2 font-medium">{formData.county}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBackToDetails}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Edit
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Municipal Lien Search</CardTitle>
        <CardDescription>
          Fill out the form below to request a new municipal lien search
        </CardDescription>
      </CardHeader>
      <form onSubmit={(e) => { e.preventDefault(); handleProceedToReview(); }}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Search By</Label>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> For properties with units or apartments, please enter the Parcel ID and County to ensure accurate results.
              </p>
            </div>
            
            <RadioGroup 
              value={formData.searchType} 
              onValueChange={(value) => handleSearchTypeChange(value as 'address' | 'parcel')}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-4 hover:border-primary">
                <RadioGroupItem value="address" id="address-search" />
                <Label htmlFor="address-search" className="font-medium cursor-pointer flex-1">
                  <div>Property Address</div>
                  <p className="font-normal text-sm text-muted-foreground">Search using the full property address</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-4 hover:border-primary">
                <RadioGroupItem value="parcel" id="parcel-search" />
                <Label htmlFor="parcel-search" className="font-medium cursor-pointer flex-1">
                  <div>Parcel ID & County</div>
                  <p className="font-normal text-sm text-muted-foreground">Search using parcel identification and county</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {formData.searchType === 'address' ? (
            <div className="space-y-2">
              <Label htmlFor="address">Property Address</Label>
              <div className="relative">
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter complete property address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="min-h-[100px]"
                />
                {isLookingUpAddress && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                )}
              </div>
              
              {formData.identifiedMunicipality && formData.identifiedCounty && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <p className="text-sm text-green-800">
                    <strong>Address Validated:</strong> City: {formData.identifiedMunicipality}, County: {formData.identifiedCounty}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="parcelId">Parcel ID / Folio Number</Label>
                <Input
                  id="parcelId"
                  name="parcelId"
                  placeholder="Enter parcel identification number"
                  value={formData.parcelId}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="county">County</Label>
                <Input
                  id="county"
                  name="county"
                  placeholder="Enter county name"
                  value={formData.county}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="space-y-4">
            <Label className="text-base font-medium">Product Type</Label>
            {!isSearchCriteriaFilled() && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <p className="text-sm text-amber-800">
                  Please fill in the search criteria above to select a product type.
                </p>
              </div>
            )}
            <RadioGroup 
              value={formData.productType} 
              onValueChange={(value) => handleProductTypeChange(value as 'full' | 'card')}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              disabled={!isSearchCriteriaFilled()}
            >
              <div className={`flex items-center space-x-2 border rounded-md p-4 ${isSearchCriteriaFilled() ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'}`}>
                <RadioGroupItem 
                  value="full" 
                  id="full-report" 
                  disabled={!isSearchCriteriaFilled()}
                />
                <Label htmlFor="full-report" className={`font-medium flex-1 ${isSearchCriteriaFilled() ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                  <div className="flex items-center gap-2">
                    Full Report
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle size={16} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm text-xs">
                          A Full Report includes everything in the Card Report—property appraiser data and current tax information—plus any additional municipal data such as open code enforcement cases, active or expired permits, and, where available, utility account status. This comprehensive option is designed for transactions or reviews requiring a deeper understanding of potential municipal obligations or compliance issues tied to the property. Please note, if a department is not listed on the report, there are no online resources for that particular county/municipality.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="font-normal text-sm text-muted-foreground">Comprehensive search with complete details</p>
                </Label>
              </div>
              
              <div className={`flex items-center space-x-2 border rounded-md p-4 ${isSearchCriteriaFilled() ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'}`}>
                <RadioGroupItem 
                  value="card" 
                  id="card-report" 
                  disabled={!isSearchCriteriaFilled()}
                />
                <Label htmlFor="card-report" className={`font-medium flex-1 ${isSearchCriteriaFilled() ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                  <div className="flex items-center gap-2">
                    Card Report
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle size={16} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-sm text-xs">
                          A Card Report includes the most recent property record (or "property card") as provided by the county property appraiser, along with current ad valorem tax information. This report is ideal for quick reference to ownership, assessed values, and tax status.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="font-normal text-sm text-muted-foreground">Summary report with essential information</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full md:w-auto"
          >
            Review Order
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OrderForm;
