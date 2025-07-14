import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { lookupAddress } from '@/services/smartyStreetsService';
import { checkLocationStatus } from '@/services/locationStatusService';
import AddressAutocomplete from './AddressAutocomplete';

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
  const [isLookingUpMunicipality, setIsLookingUpMunicipality] = useState(false);
  const [showUnsupportedDialog, setShowUnsupportedDialog] = useState(false);
  const [hasValidatedAddress, setHasValidatedAddress] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationAlertMessage, setLocationAlertMessage] = useState('');
  const [locationAlertType, setLocationAlertType] = useState<'county' | 'municipality'>('municipality');

  const getServicedMunicipalities = () => {
    return [
      // Full service municipalities (both Full Report and Card Report)
      'Miami', 'Coral Gables', 'Homestead', 'Aventura',
      'Fort Lauderdale', 'Pembroke Pines', 'Coral Springs', 'Miramar',
      'West Palm Beach', 'Boca Raton', 'Delray Beach', 'Boynton Beach', 'Wellington',
      'Orlando', 'Winter Park', 'Apopka', 'Ocoee', 'Winter Garden',
      'Tampa', 'Temple Terrace', 'Plant City', 'Oldsmar', 'Lutz',
      'St. Petersburg', 'Clearwater', 'Largo', 'Pinellas Park', 'Dunedin',
      'Jacksonville', 'Neptune Beach', 'Jacksonville Beach', 'Baldwin',
      'Fort Myers', 'Cape Coral', 'Bonita Springs', 'Estero', 'Sanibel',
      'Lakeland', 'Winter Haven', 'Bartow', 'Auburndale', 'Lake Wales',
      'Melbourne', 'Rockledge',
      
      // Card Report only municipalities
      'Titusville', 'Palm Bay', 'Cocoa', 'Hollywood', 'Fort White', 
      'Atlantic Beach', 'Century', 'Weeki Wachee', 'Lake Placid',
      'Miami Beach', 'Port Richey', 'Gulf Breeze', 'Longboat Key',
      'Casselberry', 'Deltona', 'New Smyrna Beach', 'St. Marks'
    ];
  };

  const isMunicipalityServiced = (municipality: string) => {
    const servicedMunicipalities = getServicedMunicipalities();
    return servicedMunicipalities.includes(municipality);
  };

  const getMockMunicipalities = (county: string) => {
    const municipalitiesByCounty: { [key: string]: string[] } = {
      'Miami-Dade': ['Miami', 'Miami Beach', 'Coral Gables', 'Homestead', 'Aventura'],
      'Broward': ['Fort Lauderdale', 'Hollywood', 'Pembroke Pines', 'Coral Springs', 'Miramar'],
      'Palm Beach': ['West Palm Beach', 'Boca Raton', 'Delray Beach', 'Boynton Beach', 'Wellington'],
      'Orange': ['Orlando', 'Winter Park', 'Apopka', 'Ocoee', 'Winter Garden'],
      'Hillsborough': ['Tampa', 'Temple Terrace', 'Plant City', 'Oldsmar', 'Lutz'],
      'Pinellas': ['St. Petersburg', 'Clearwater', 'Largo', 'Pinellas Park', 'Dunedin'],
      'Duval': ['Jacksonville', 'Atlantic Beach', 'Neptune Beach', 'Jacksonville Beach', 'Baldwin'],
      'Lee': ['Fort Myers', 'Cape Coral', 'Bonita Springs', 'Estero', 'Sanibel'],
      'Polk': ['Lakeland', 'Winter Haven', 'Bartow', 'Auburndale', 'Lake Wales'],
      'Brevard': ['Melbourne', 'Palm Bay', 'Titusville', 'Cocoa', 'Rockledge']
    };

    const normalizedCounty = county.toLowerCase().replace(/\s+/g, '');
    const matchingKey = Object.keys(municipalitiesByCounty).find(key => 
      key.toLowerCase().replace(/\s+/g, '').includes(normalizedCounty) ||
      normalizedCounty.includes(key.toLowerCase().replace(/\s+/g, ''))
    );

    return matchingKey ? municipalitiesByCounty[matchingKey] : ['Generic City', 'Sample Municipality', 'Test Town'];
  };

  const handleMunicipalityLookup = async () => {
    if (!formData.parcelId || !formData.county) {
      toast.error('Please enter both Parcel ID and County');
      return;
    }

    setIsLookingUpMunicipality(true);
    
    setTimeout(() => {
      const municipalities = getMockMunicipalities(formData.county);
      const randomMunicipality = municipalities[Math.floor(Math.random() * municipalities.length)];
      
      setFormData(prev => ({
        ...prev,
        identifiedMunicipality: randomMunicipality,
        identifiedCounty: formData.county
      }));
      
      if (onAddressLookup) {
        onAddressLookup(randomMunicipality, formData.county);
      }
      
      const locationStatus = checkLocationStatus(randomMunicipality, formData.county);
      if (!locationStatus.isAvailable) {
        setLocationAlertMessage(locationStatus.alertMessage || 'This location is currently unavailable for orders.');
        setLocationAlertType(locationStatus.type);
        setShowLocationAlert(true);
      } else if (isMunicipalityServiced(randomMunicipality)) {
        toast.success(`Municipality identified: ${randomMunicipality}, ${formData.county} County`);
      } else {
        setShowUnsupportedDialog(true);
      }
      setIsLookingUpMunicipality(false);
    }, 10000);
  };

  useEffect(() => {
    if (formData.searchType === 'address' && formData.address.length > 10 && !hasValidatedAddress) {
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
            
            setHasValidatedAddress(true);
            
            if (onAddressLookup) {
              onAddressLookup(result.municipality, result.county);
            }
            
            const locationStatus = checkLocationStatus(result.municipality, result.county);
            if (!locationStatus.isAvailable) {
              setLocationAlertMessage(locationStatus.alertMessage || 'This location is currently unavailable for orders.');
              setLocationAlertType(locationStatus.type);
              setShowLocationAlert(true);
            } else if (isMunicipalityServiced(result.municipality)) {
              toast.success(`Address validated: ${result.municipality}, ${result.county}`);
            } else {
              setShowUnsupportedDialog(true);
            }
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
  }, [formData.address, formData.searchType, onAddressLookup, hasValidatedAddress]);

  const isSearchCriteriaFilled = () => {
    if (formData.searchType === 'address') {
      return formData.address.trim() !== '' && formData.identifiedMunicipality;
    } else {
      return formData.parcelId.trim() !== '' && formData.county.trim() !== '' && formData.identifiedMunicipality;
    }
  };

  const isProductSelectionAllowed = () => {
    if (!isSearchCriteriaFilled() || !formData.identifiedMunicipality) {
      return false;
    }
    
    const locationStatus = checkLocationStatus(formData.identifiedMunicipality, formData.identifiedCounty || '');
    if (!locationStatus.isAvailable) {
      return false;
    }
    
    return isMunicipalityServiced(formData.identifiedMunicipality);
  };

  const handleAddressChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      address: value
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductTypeChange = (value: 'full' | 'card') => {
    if (isProductSelectionAllowed()) {
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
      address: '',
      parcelId: '',
      county: '',
      identifiedMunicipality: undefined,
      identifiedCounty: undefined
    }));
    
    setHasValidatedAddress(false);
    
    if (onAddressLookup) {
      onAddressLookup('', '');
    }
  };

  const handleProceedToReview = () => {
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
      if (!formData.identifiedMunicipality) {
        toast.error('Please search for municipality first');
        return;
      }
    }
    
    if (!isProductSelectionAllowed()) {
      toast.error('Products are not available for this municipality');
      return;
    }
    
    setCurrentStep('review');
  };

  const handleBackToDetails = () => {
    setCurrentStep('details');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log('Order submitted:', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      
      toast.success('Municipal lien search order submitted successfully!');
      
      setTimeout(() => {
        setFormData({
          address: '',
          parcelId: '',
          county: '',
          productType: 'full',
          searchType: 'address'
        });
        setCurrentStep('details');
        setIsSuccess(false);
        setHasValidatedAddress(false);
        
        if (onAddressLookup) {
          onAddressLookup('', '');
        }
      }, 5000);
    }, 1500);
  };

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
                  
                  {formData.identifiedMunicipality && formData.identifiedCounty && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 text-sm text-muted-foreground">Identified Municipality</div>
                      <div className="col-span-2 font-medium text-green-600">
                        City: {formData.identifiedMunicipality}, County: {formData.identifiedCounty}
                      </div>
                    </div>
                  )}
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
    <>
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
                <AddressAutocomplete
                  value={formData.address}
                  onChange={handleAddressChange}
                  placeholder="Enter complete property address"
                  className="min-h-[100px]"
                  isLoading={isLookingUpAddress}
                />
                
                {formData.identifiedMunicipality && formData.identifiedCounty && isMunicipalityServiced(formData.identifiedMunicipality) && (
                  <div className="border rounded-md p-3 bg-green-50 border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Address Validated:</strong> City: {formData.identifiedMunicipality}, County: {formData.identifiedCounty}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              
                <div className="flex justify-center">
                  <Button 
                    type="button" 
                    onClick={handleMunicipalityLookup}
                    disabled={!formData.parcelId || !formData.county || isLookingUpMunicipality}
                    className="w-full md:w-auto"
                  >
                    {isLookingUpMunicipality ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching Municipality...
                      </>
                    ) : (
                      'Search Municipality'
                    )}
                  </Button>
                </div>
                
                {formData.identifiedMunicipality && formData.identifiedCounty && isMunicipalityServiced(formData.identifiedMunicipality) && (
                  <div className="border rounded-md p-3 bg-green-50 border-green-200">
                    <p className="text-sm text-green-800">
                      <strong>Municipality Identified:</strong> City: {formData.identifiedMunicipality}, County: {formData.identifiedCounty}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <Label className="text-base font-medium">Product Type</Label>
              {!isProductSelectionAllowed() && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <p className="text-sm text-amber-800">
                    {!isSearchCriteriaFilled() ? (
                      formData.searchType === 'address' 
                        ? 'Please enter an address and wait for validation to select a product type.'
                        : 'Please enter parcel information and search for municipality to select a product type.'
                    ) : (
                      formData.identifiedMunicipality && !isMunicipalityServiced(formData.identifiedMunicipality)
                        ? 'Product selection is not available for this municipality.'
                        : 'Please complete the search criteria above.'
                    )}
                  </p>
                </div>
              )}
              <RadioGroup 
                value={formData.productType} 
                onValueChange={(value) => handleProductTypeChange(value as 'full' | 'card')}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                disabled={!isProductSelectionAllowed()}
              >
                <div className={`flex items-center space-x-2 border rounded-md p-4 ${isProductSelectionAllowed() ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'}`}>
                  <RadioGroupItem 
                    value="full" 
                    id="full-report" 
                    disabled={!isProductSelectionAllowed()}
                  />
                  <Label htmlFor="full-report" className={`font-medium flex-1 ${isProductSelectionAllowed() ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
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
              
                <div className={`flex items-center space-x-2 border rounded-md p-4 ${isProductSelectionAllowed() ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'}`}>
                  <RadioGroupItem 
                    value="card" 
                    id="card-report" 
                    disabled={!isProductSelectionAllowed()}
                  />
                  <Label htmlFor="card-report" className={`font-medium flex-1 ${isProductSelectionAllowed() ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
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
              disabled={!isProductSelectionAllowed()}
            >
              Review Order
            </Button>
          </CardFooter>
        </form>
      </Card>

      <AlertDialog open={showUnsupportedDialog} onOpenChange={setShowUnsupportedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Service Not Available</AlertDialogTitle>
            <AlertDialogDescription>
              We're sorry, we do not currently offer any products in {formData.identifiedMunicipality}, {formData.identifiedCounty} County. 
              Please try a different address or contact us for more information about future service availability.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowUnsupportedDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLocationAlert} onOpenChange={setShowLocationAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Municipality Site Maintenance</AlertDialogTitle>
            <AlertDialogDescription>
              {locationAlertMessage}
              <br /><br />
              <strong>Location:</strong> {formData.identifiedMunicipality}, {formData.identifiedCounty} County
              <br />
              <strong>Type:</strong> {locationAlertType === 'county' ? 'County' : 'Municipality'} unavailable
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowLocationAlert(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderForm;
