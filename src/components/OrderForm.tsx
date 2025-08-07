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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { checkLocationStatus } from '@/services/locationStatusService';
import { fetchPlaces, Place, checkMunicipalityAvailability, checkMunicipalityAvailabilityByAddress, MunicipalityAvailabilityResponse, ReportRequestResponse, submitReportRequestByParcel, submitReportRequestByAddress } from '@/services/orderService';
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
  onMunicipalityDataChange?: (data: MunicipalityAvailabilityResponse | null) => void;
}

const OrderForm = ({ onAddressLookup, onMunicipalityDataChange }: OrderFormProps) => {
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
  const [hasSeenLocationAlert, setHasSeenLocationAlert] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const [locationAlertMessage, setLocationAlertMessage] = useState('');
  const [locationAlertType, setLocationAlertType] = useState<'county' | 'municipality'>('municipality');
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);
  const [municipalityData, setMunicipalityData] = useState<MunicipalityAvailabilityResponse | null>(null);

  // Load places data
  useEffect(() => {
    const loadPlaces = async () => {
      try {
        setIsLoadingPlaces(true);
        const fetchedPlaces = await fetchPlaces();
        setPlaces(fetchedPlaces);
      } catch (error) {
        console.error('Failed to load places:', error);
        // Use mock data as fallback
        setPlaces([]);
      } finally {
        setIsLoadingPlaces(false);
      }
    };

    loadPlaces();
  }, []);



  // Check if municipality is serviced using API data
  const isMunicipalityServiced = (municipality: string) => {
    if (!municipality || !municipalityData) return false;
    
    const municipalityInfo = municipalityData.SubPlace.find(subPlace => subPlace.SubPlaceName === municipality);
    const isServiced = municipalityInfo && municipalityInfo.SubPlaceStatus === "Active";
    console.log(`isMunicipalityServiced for ${municipality}:`, isServiced, municipalityInfo);
    return isServiced;
  };

  // Check if any reports are available for a municipality
  const isAnyReportAvailable = (municipality: string) => {
    if (!municipality || !municipalityData) return false;
    
    const municipalityInfo = municipalityData.SubPlace.find(subPlace => subPlace.SubPlaceName === municipality);
    if (!municipalityInfo || !municipalityInfo.Report) return false;
    
    const hasReports = municipalityInfo.Report.length > 0;
    console.log(`isAnyReportAvailable for ${municipality}:`, hasReports, municipalityInfo.Report);
    return hasReports;
  };


  // Get available services for a municipality from API data
  const getAvailableServices = (municipality: string) => {
    if (!municipality || !municipalityData) return [];
    
    const municipalityInfo = municipalityData.SubPlace.find(subPlace => subPlace.SubPlaceName === municipality);
    if (!municipalityInfo) return [];
    
    return municipalityInfo.Service.map(service => service.PlaceServiceName);
  };

  // Check if Full Report is available for a municipality from API data
  const isFullReportAvailable = (municipality: string) => {
    if (!municipality || !municipalityData) return false;
    
    const municipalityInfo = municipalityData.SubPlace.find(subPlace => subPlace.SubPlaceName === municipality);
    if (!municipalityInfo || !municipalityInfo.Report) return false;
    
    const hasFullReport = municipalityInfo.Report.some(report => report.SubPlaceOrderReportType === "1");
    console.log(`isFullReportAvailable for ${municipality}:`, hasFullReport, municipalityInfo.Report);
    return hasFullReport;
  };

  // Check if Card Report is available for a municipality from API data
  const isCardReportAvailable = (municipality: string) => {
    if (!municipality || !municipalityData) return false;
    
    const municipalityInfo = municipalityData.SubPlace.find(subPlace => subPlace.SubPlaceName === municipality);
    if (!municipalityInfo || !municipalityInfo.Report) return false;
    
    const hasCardReport = municipalityInfo.Report.some(report => report.SubPlaceOrderReportType === "0");
    console.log(`isCardReportAvailable for ${municipality}:`, hasCardReport, municipalityInfo.Report);
    return hasCardReport;
  };

  // Real municipality lookup using API
  const handleMunicipalityLookup = async () => {
    if (!formData.parcelId || !formData.county) {
      toast.error('Please enter both Parcel ID and County');
      return;
    }

    setIsLookingUpMunicipality(true);
    
    try {
      const response = await checkMunicipalityAvailability(formData.parcelId, formData.county);
      setMunicipalityData(response);
      console.log('Municipality data set:', response);
      if (onMunicipalityDataChange) {
        onMunicipalityDataChange(response);
      }
      
      // Check if the response has valid data
      if (response.SubPlace && response.SubPlace.length > 0) {
        const municipality = response.SubPlace[0];
        
        setFormData(prev => ({
          ...prev,
          identifiedMunicipality: municipality.SubPlaceName,
          identifiedCounty: response.PlaceName
        }));
        
        if (onAddressLookup) {
          onAddressLookup(municipality.SubPlaceName, response.PlaceName);
        }
        
        const locationStatus = checkLocationStatus(municipality.SubPlaceName, response.PlaceName);
        if (!locationStatus.isAvailable && !hasSeenLocationAlert) {
          setLocationAlertMessage(locationStatus.alertMessage || 'This location is currently unavailable for orders.');
          setLocationAlertType(locationStatus.type);
          setShowLocationAlert(true);
        } else {
          toast.success(`Municipality identified: ${formatMunicipalityDisplayName(municipality.SubPlaceName, response.PlaceName)}`);
        }
      } else {
        toast.error('No municipality found for the provided parcel ID and county');
      }
    } catch (error) {
      console.error('Error looking up municipality:', error);
      toast.error('Failed to lookup municipality. Please try again.');
    } finally {
      setIsLookingUpMunicipality(false);
    }
  };

  // Helper function to format municipality display name
  const formatMunicipalityDisplayName = (municipalityName: string, countyName: string) => {
    return municipalityName === countyName 
      ? `${municipalityName} County`
      : `${municipalityName}, ${countyName} County`;
  };

  const isSearchCriteriaFilled = () => {
    if (formData.searchType === 'address') {
      return formData.address.trim() !== '' && formData.identifiedMunicipality && formData.identifiedCounty;
    } else {
      return formData.parcelId.trim() !== '' && formData.county.trim() !== '' && formData.identifiedMunicipality && formData.identifiedCounty;
    }
  };

  const isProductSelectionAllowed = () => {
    if (!isSearchCriteriaFilled() || !formData.identifiedMunicipality) {
      console.log('isProductSelectionAllowed: Search criteria not filled or no municipality identified');
      return false;
    }
    
    // Check if municipality is serviced AND has at least one report available
    const isServiced = isMunicipalityServiced(formData.identifiedMunicipality);
    const hasReports = isAnyReportAvailable(formData.identifiedMunicipality);
    const allowed = isServiced && hasReports;
    console.log(`isProductSelectionAllowed for ${formData.identifiedMunicipality}:`, allowed, { isServiced, hasReports });
    return allowed;
  };

  // Handle municipality availability check by address
  const handleMunicipalityAvailabilityByAddress = async (address: string) => {
    console.log('handleMunicipalityAvailabilityByAddress called with address:', address);
    console.log('Address length:', address.length);
    
    if (!address || address.length < 10) {
      console.log('Address validation failed: address too short or empty');
      return;
    }
    
    console.log('Starting municipality lookup for address:', address);
    setIsLookingUpAddress(true);
    
    try {
      console.log('Calling checkMunicipalityAvailabilityByAddress API...');
      const response = await checkMunicipalityAvailabilityByAddress(address);
      console.log('API response received:', response);
      setMunicipalityData(response);
      console.log('Municipality data set (address):', response);
      if (onMunicipalityDataChange) {
        onMunicipalityDataChange(response);
      }
      
      // Check if the response has valid data
      if (response.SubPlace && response.SubPlace.length > 0) {
        const municipality = response.SubPlace[0];
        console.log('Municipality found:', municipality.SubPlaceName, 'County:', response.PlaceName);
        
        setFormData(prev => ({
          ...prev,
          identifiedMunicipality: municipality.SubPlaceName,
          identifiedCounty: response.PlaceName
        }));
        
        if (onAddressLookup) {
          onAddressLookup(municipality.SubPlaceName, response.PlaceName);
        }
        
        const locationStatus = checkLocationStatus(municipality.SubPlaceName, response.PlaceName);
        if (!locationStatus.isAvailable && !hasSeenLocationAlert) {
          setLocationAlertMessage(locationStatus.alertMessage || 'This location is currently unavailable for orders.');
          setLocationAlertType(locationStatus.type);
          setShowLocationAlert(true);
        } else {
          toast.success(`Municipality identified: ${formatMunicipalityDisplayName(municipality.SubPlaceName, response.PlaceName)}`);
        }
      } else {
        toast.error('No municipality found for the provided address');
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
      console.error('Error checking municipality availability by address:', error);
      toast.error('Failed to check municipality availability. Please try again.');
      
      setFormData(prev => ({
        ...prev,
        identifiedMunicipality: undefined,
        identifiedCounty: undefined
      }));
      
      if (onAddressLookup) {
        onAddressLookup('', '');
      }
    } finally {
      setIsLookingUpAddress(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      address: value
    }));
    
    // Only reset validation state if the address is being cleared or significantly changed
    // Don't reset if it's just being updated with a complete address from Google Places
    if (value === '' || (value !== formData.address && value.length < 10)) {
      setMunicipalityData(null);
      if (onMunicipalityDataChange) {
        onMunicipalityDataChange(null);
      }
      setFormData(prev => ({
        ...prev,
        identifiedMunicipality: undefined,
        identifiedCounty: undefined
      }));
      
      if (onAddressLookup) {
        onAddressLookup('', '');
      }
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
    
    setHasSeenLocationAlert(false);
    setMunicipalityData(null);
    if (onMunicipalityDataChange) {
      onMunicipalityDataChange(null);
    }
    
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
      if (!formData.identifiedCounty) {
        toast.error('County information is required. Please ensure address validation is complete.');
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
      if (!formData.identifiedCounty) {
        toast.error('County information is required. Please ensure municipality lookup is complete.');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let response: ReportRequestResponse;
      
      if (formData.searchType === 'address') {
        // For address search, use the address-based API endpoint
        const countyName = formData.identifiedCounty;
        
        if (!countyName) {
          toast.error('County information is required. Please ensure address validation is complete.');
          setIsSubmitting(false);
          return;
        }
        
        console.log('Submitting address-based order:', {
          address: formData.address,
          countyName,
          reportType: formData.productType
        });
        
        // Submit the report request using address endpoint
        response = await submitReportRequestByAddress(
          formData.address,
          countyName,
          formData.productType
        );
      } else {
        // For parcel search, use the parcel-based API endpoint
        const parcelId = formData.parcelId;
        const countyName = formData.identifiedCounty;
        
        if (!countyName) {
          toast.error('County information is required. Please ensure municipality lookup is complete.');
          setIsSubmitting(false);
          return;
        }
        
        console.log('Submitting parcel-based order:', {
          parcelId,
          countyName,
          reportType: formData.productType
        });
        
        // Submit the report request using parcel endpoint
        response = await submitReportRequestByParcel(
          countyName,
          parcelId,
          formData.productType
        );
      }
      
      console.log('Order submitted successfully:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null/undefined');
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      toast.success('Municipal lien search order submitted successfully!');
      
      // Reset form after 5 seconds
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
        setHasSeenLocationAlert(false);
        setMunicipalityData(null);
        if (onMunicipalityDataChange) {
          onMunicipalityDataChange(null);
        }
        
        if (onAddressLookup) {
          onAddressLookup('', '');
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting order:', error);
      setIsSubmitting(false);
      toast.error('Failed to submit order. Please try again.');
    }
  };

  const handleLocationAlertClose = () => {
    setShowLocationAlert(false);
    setHasSeenLocationAlert(true);
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
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-sm text-muted-foreground">Identified Location</div>
                        <div className="col-span-2 font-medium text-green-600">
                          City: {formData.identifiedMunicipality}, County: {formData.identifiedCounty}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-sm text-muted-foreground">Available Services</div>
                        <div className="col-span-2 font-medium text-blue-600">
                          {getAvailableServices(formData.identifiedMunicipality).join(', ')}
                        </div>
                      </div>
                    </>
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
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-sm text-muted-foreground">Identified Municipality</div>
                        <div className="col-span-2 font-medium text-green-600">
                          City: {formData.identifiedMunicipality}, County: {formData.identifiedCounty}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1 text-sm text-muted-foreground">Available Services</div>
                        <div className="col-span-2 font-medium text-blue-600">
                          {getAvailableServices(formData.identifiedMunicipality).join(', ')}
                        </div>
                      </div>
                    </>
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
                  onAddressSelected={handleMunicipalityAvailabilityByAddress}
                  placeholder="Enter complete property address"
                  className="min-h-[100px]"
                  isLoading={isLookingUpAddress}
                />
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
                    <Select
                      value={formData.county}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, county: value }))}
                      disabled={isLoadingPlaces}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingPlaces ? "Loading counties..." : "Select a county"} />
                      </SelectTrigger>
                      <SelectContent>
                        {places.map((place) => (
                          <SelectItem key={place.PlaceID} value={place.PlaceName}>
                            {place.PlaceName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        : formData.identifiedMunicipality && !isAnyReportAvailable(formData.identifiedMunicipality)
                        ? 'No reports are available for this municipality at this time.'
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
                <div className={`flex items-center space-x-2 border rounded-md p-4 ${isProductSelectionAllowed() && isFullReportAvailable(formData.identifiedMunicipality || '') ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'}`}>
                  <RadioGroupItem 
                    value="full" 
                    id="full-report" 
                    disabled={!isProductSelectionAllowed() || !isFullReportAvailable(formData.identifiedMunicipality || '')}
                  />
                  <Label htmlFor="full-report" className={`font-medium flex-1 ${isProductSelectionAllowed() && isFullReportAvailable(formData.identifiedMunicipality || '') ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
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
              
                <div className={`flex items-center space-x-2 border rounded-md p-4 ${isProductSelectionAllowed() && isCardReportAvailable(formData.identifiedMunicipality || '') ? 'hover:border-primary' : 'opacity-50 cursor-not-allowed'}`}>
                  <RadioGroupItem 
                    value="card" 
                    id="card-report" 
                    disabled={!isProductSelectionAllowed() || !isCardReportAvailable(formData.identifiedMunicipality || '')}
                  />
                  <Label htmlFor="card-report" className={`font-medium flex-1 ${isProductSelectionAllowed() && isCardReportAvailable(formData.identifiedMunicipality || '') ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
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

      <AlertDialog open={showLocationAlert} onOpenChange={handleLocationAlertClose}>
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
            <AlertDialogAction onClick={handleLocationAlertClose}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderForm;
