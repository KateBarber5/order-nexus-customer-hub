import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, HelpCircle, Loader2, AlertTriangle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogFooter,
  AlertDialogAction
} from '@/components/ui/alert-dialog';
import AddressAutocomplete from './AddressAutocomplete';
import { getMunicipalityAlertMessage } from '@/utils/municipalityUtils';

interface OrderFormData {
  address: string;
  parcelId: string;
  county: string;
  service: string;
  searchType: 'address' | 'parcel';
}

interface OrderFormProps {
  onAddressLookup?: (municipality: string, county: string) => void;
}

const OrderForm = ({ onAddressLookup }: OrderFormProps) => {
  const [formData, setFormData] = useState<OrderFormData>({
    address: '',
    parcelId: '',
    county: '',
    service: 'property-records',
    searchType: 'address'
  });
  
  const [isValidatingAddress, setIsValidatingAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUpAddress, setIsLookingUpAddress] = useState(false);
  const [isLookingUpMunicipality, setIsLookingUpMunicipality] = useState(false);
  const [showUnsupportedDialog, setShowUnsupportedDialog] = useState(false);
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [municipalityAlert, setMunicipalityAlert] = useState('');
  const [hasValidatedAddress, setHasValidatedAddress] = useState(false);

  // Define all municipalities that we service - this should match the logic in Orders.tsx
  const servicedMunicipalities = [
    // Miami-Dade County
    'Miami', 'Homestead', 'Coral Gables', 'Miami Beach', 'Aventura', 'Key Biscayne',
    'Palmetto Bay', 'Pinecrest', 'South Miami', 'Bal Harbour', 'Bay Harbor Islands',
    'Biscayne Park', 'El Portal', 'Florida City', 'Golden Beach', 'Hialeah', 'Hialeah Gardens',
    'Indian Creek', 'Islandia', 'Medley', 'Miami Gardens', 'Miami Lakes', 'Miami Shores',
    'Miami Springs', 'North Bay Village', 'North Miami', 'North Miami Beach', 'Opa-locka',
    'Surfside', 'Sweetwater', 'Virginia Gardens', 'West Miami', 'Westchester',
    
    // Broward County
    'Fort Lauderdale', 'Hollywood', 'Pembroke Pines', 'Coral Springs', 'Miramar',
    'Davie', 'Plantation', 'Sunrise', 'Pompano Beach', 'Deerfield Beach', 'Weston',
    'Margate', 'Coconut Creek', 'Tamarac', 'Cooper City', 'Lauderhill', 'Oakland Park',
    'Wilton Manors', 'Lighthouse Point', 'Lauderdale Lakes', 'North Lauderdale',
    'Parkland', 'Coral Springs', 'Hallandale Beach', 'Aventura', 'Dania Beach',
    
    // Palm Beach County
    'West Palm Beach', 'Boca Raton', 'Delray Beach', 'Boynton Beach', 'Jupiter',
    'Lake Worth', 'Riviera Beach', 'Greenacres', 'Royal Palm Beach', 'Wellington',
    'Palm Beach Gardens', 'Lantana', 'Atlantis', 'Belle Glade', 'Briny Breezes',
    'Cloud Lake', 'Gulf Stream', 'Haverhill', 'Highland Beach', 'Hillsboro Beach',
    'Hypoluxo', 'Juno Beach', 'Jupiter Inlet Colony', 'Lake Clarke Shores', 'Lake Park',
    'Loxahatchee Groves', 'Manalapan', 'Mangonia Park', 'North Palm Beach', 'Ocean Ridge',
    'Pahokee', 'Palm Beach', 'Palm Beach Shores', 'Palm Springs', 'Pelican Lake',
    'South Bay', 'South Palm Beach', 'Tequesta', 'Village of Golf'
  ];

  const floridaCounties = [
    'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun', 'Charlotte',
    'Citrus', 'Clay', 'Collier', 'Columbia', 'DeSoto', 'Dixie', 'Duval', 'Escambia',
    'Flagler', 'Franklin', 'Gadsden', 'Gilchrist', 'Glades', 'Gulf', 'Hamilton',
    'Hardee', 'Hendry', 'Hernando', 'Highlands', 'Hillsborough', 'Holmes', 'Indian River',
    'Jackson', 'Jefferson', 'Lafayette', 'Lake', 'Lee', 'Leon', 'Levy', 'Liberty',
    'Madison', 'Manatee', 'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau',
    'Okaloosa', 'Okeechobee', 'Orange', 'Osceola', 'Palm Beach', 'Pasco', 'Pinellas',
    'Polk', 'Putnam', 'Santa Rosa', 'Sarasota', 'Seminole', 'St. Johns', 'St. Lucie',
    'Sumter', 'Suwannee', 'Taylor', 'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington'
  ];

  const isMunicipalityServiced = (municipality: string): boolean => {
    return servicedMunicipalities.some(serviced => 
      serviced.toLowerCase() === municipality.toLowerCase()
    );
  };

  const getMunicipalitiesForCounty = (county: string): string[] => {
    const municipalitiesByCounty: { [key: string]: string[] } = {
      'Miami-Dade': ['Miami', 'Homestead', 'Coral Gables', 'Miami Beach', 'Aventura', 'Key Biscayne'],
      'Broward': ['Fort Lauderdale', 'Hollywood', 'Pembroke Pines', 'Coral Springs', 'Miramar'],
      'Palm Beach': ['West Palm Beach', 'Boca Raton', 'Delray Beach', 'Boynton Beach', 'Jupiter'],
      'Orange': ['Orlando', 'Winter Park', 'Apopka', 'Ocoee', 'Winter Garden'],
      'Hillsborough': ['Tampa', 'Plant City', 'Temple Terrace'],
      'Pinellas': ['St. Petersburg', 'Clearwater', 'Largo', 'Pinellas Park'],
      'Duval': ['Jacksonville', 'Jacksonville Beach', 'Atlantic Beach', 'Neptune Beach'],
      'Lee': ['Fort Myers', 'Cape Coral', 'Bonita Springs', 'Estero'],
      'Polk': ['Lakeland', 'Winter Haven', 'Bartow', 'Haines City'],
      'Volusia': ['Daytona Beach', 'DeLand', 'Ormond Beach', 'New Smyrna Beach']
    };
    
    const matchingKey = Object.keys(municipalitiesByCounty).find(key => 
      key.toLowerCase().includes(county.toLowerCase()) || county.toLowerCase().includes(key.toLowerCase())
    );
    
    return matchingKey ? municipalitiesByCounty[matchingKey] : ['Generic City', 'Sample Municipality', 'Test Town'];
  };

  // Check for alert message and show dialog
  const checkAndShowMunicipalityAlert = (municipality: string) => {
    const alertMessage = getMunicipalityAlertMessage(municipality);
    if (alertMessage) {
      setMunicipalityAlert(alertMessage);
      setShowAlertDialog(true);
    }
  };

  const handleMunicipalityLookup = async () => {
    if (!formData.parcelId || !formData.county) {
      toast.error('Please enter both Parcel ID and County before looking up municipality');
      return;
    }

    setIsLookingUpMunicipality(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const availableMunicipalities = getMunicipalitiesForCounty(formData.county);
      const randomMunicipality = availableMunicipalities[Math.floor(Math.random() * availableMunicipalities.length)];
      
      console.log('Municipality lookup result:', randomMunicipality);
      
      if (isMunicipalityServiced(randomMunicipality)) {
        toast.success(`Municipality identified: ${randomMunicipality}, ${formData.county} County`);
        checkAndShowMunicipalityAlert(randomMunicipality);
      } else {
        setShowUnsupportedDialog(true);
      }
      
      if (onAddressLookup) {
        onAddressLookup(randomMunicipality, formData.county);
      }
    } catch (error) {
      console.error('Municipality lookup error:', error);
      toast.error('Failed to look up municipality. Please try again.');
    } finally {
      setIsLookingUpMunicipality(false);
    }
  };

  const handleAddressValidation = async () => {
    if (!formData.address) {
      toast.error('Please enter an address');
      return;
    }

    setIsValidatingAddress(true);
    
    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: formData.address }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.isValid) {
          setFormData(prev => ({ ...prev, county: result.county }));
          setHasValidatedAddress(true);
          
          if (isMunicipalityServiced(result.municipality)) {
            toast.success(`Address validated: ${result.municipality}, ${result.county}`);
            checkAndShowMunicipalityAlert(result.municipality);
          } else {
            setShowUnsupportedDialog(true);
          }
          
          if (onAddressLookup) {
            onAddressLookup(result.municipality, result.county);
          }
        } else {
          toast.error('Address could not be validated. Please check and try again.');
        }
      } else {
        throw new Error('Validation service unavailable');
      }
    } catch (error) {
      console.error('Address validation error:', error);
      toast.error('Address validation failed. Please try again.');
    } finally {
      setIsValidatingAddress(false);
    }
  };

  const handleAddressSelect = (selectedAddress: string) => {
    setFormData(prev => ({ ...prev, address: selectedAddress }));
    setHasValidatedAddress(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.searchType === 'address' && !hasValidatedAddress) {
      toast.error('Please validate your address before submitting');
      return;
    }
    
    if (formData.searchType === 'parcel' && (!formData.parcelId || !formData.county)) {
      toast.error('Please enter both Parcel ID and County');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Order submitted:', formData);
      toast.success('Order submitted successfully!');
      
      setFormData({
        address: '',
        parcelId: '',
        county: '',
        service: 'property-records',
        searchType: 'address'
      });
      setHasValidatedAddress(false);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Order Property Records</CardTitle>
          <CardDescription>
            Enter your property information to order records and certificates
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Search Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">How would you like to search?</Label>
              <RadioGroup
                value={formData.searchType}
                onValueChange={(value: 'address' | 'parcel') => 
                  setFormData(prev => ({ ...prev, searchType: value }))
                }
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="address" id="address-search" />
                  <Label htmlFor="address-search" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Property Address</div>
                      <div className="text-sm text-gray-500">Search using street address</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="parcel" id="parcel-search" />
                  <Label htmlFor="parcel-search" className="cursor-pointer">
                    <div>
                      <div className="font-medium">Parcel ID</div>
                      <div className="text-sm text-gray-500">Search using parcel number</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Address Search Fields */}
            {formData.searchType === 'address' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="address">Property Address</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the complete street address including city and state</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <AddressAutocomplete
                    value={formData.address}
                    onChange={handleAddressSelect}
                    placeholder="Enter full property address"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleAddressValidation}
                    disabled={!formData.address || isValidatingAddress}
                    className="flex-1"
                  >
                    {isValidatingAddress ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      'Validate Address'
                    )}
                  </Button>
                </div>

                {hasValidatedAddress && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800">
                      <div className="text-sm">
                        ✓ Address validated successfully
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Parcel Search Fields */}
            {formData.searchType === 'parcel' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="parcel-id">Parcel ID</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the property's parcel identification number</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="parcel-id"
                      value={formData.parcelId}
                      onChange={(e) => setFormData(prev => ({ ...prev, parcelId: e.target.value }))}
                      placeholder="e.g., 123-456-789"
                      required={formData.searchType === 'parcel'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <select
                      id="county"
                      value={formData.county}
                      onChange={(e) => setFormData(prev => ({ ...prev, county: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={formData.searchType === 'parcel'}
                    >
                      <option value="">Select County</option>
                      {floridaCounties.map(county => (
                        <option key={county} value={county}>{county} County</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleMunicipalityLookup}
                  disabled={!formData.parcelId || !formData.county || isLookingUpMunicipality}
                  className="w-full"
                >
                  {isLookingUpMunicipality ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Looking up municipality...
                    </>
                  ) : (
                    'Lookup Municipality'
                  )}
                </Button>
              </div>
            )}

            {/* Service Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Select Service</Label>
              <RadioGroup
                value={formData.service}
                onValueChange={(value) => setFormData(prev => ({ ...prev, service: value }))}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="property-records" id="property-records" />
                  <Label htmlFor="property-records" className="cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">Property Records</div>
                      <div className="text-sm text-gray-500">Official property ownership and history documents</div>
                    </div>
                  </Label>
                  <div className="text-sm font-medium text-gray-700">$25.00</div>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="building-permits" id="building-permits" />
                  <Label htmlFor="building-permits" className="cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">Building Permits</div>
                      <div className="text-sm text-gray-500">Construction and renovation permit history</div>
                    </div>
                  </Label>
                  <div className="text-sm font-medium text-gray-700">$15.00</div>
                </div>
                
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="code-violations" id="code-violations" />
                  <Label htmlFor="code-violations" className="cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">Code Violations</div>
                      <div className="text-sm text-gray-500">Municipal code compliance and violation records</div>
                    </div>
                  </Label>
                  <div className="text-sm font-medium text-gray-700">$10.00</div>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Order'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Municipality Alert Dialog */}
      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Municipality Notice
            </AlertDialogTitle>
            <AlertDialogDescription>
              {municipalityAlert}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAlertDialog(false)}>
              I Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showUnsupportedDialog} onOpenChange={setShowUnsupportedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Municipality Not Supported</AlertDialogTitle>
            <AlertDialogDescription>
              We currently don't provide services for this municipality. Please contact support for more information about expanding our coverage to your area.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowUnsupportedDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderForm;
