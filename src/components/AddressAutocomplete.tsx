
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelected?: (address: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelected,
  placeholder,
  className,
  isLoading
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loaderRef = useRef<Loader | null>(null);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    const initializeGooglePlaces = async () => {
      // Prevent multiple simultaneous initializations
      if (isInitializingRef.current) {
        return;
      }
      
      isInitializingRef.current = true;
      
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        console.log('Google Maps API key found:', !!apiKey);
        
        // Only try to load Google Maps if we have a valid API key
        if (!apiKey || apiKey.trim() === '') {
          console.log('Google Maps API key not found, using basic input instead');
          setIsGoogleLoaded(false);
          return;
        }

        console.log('Loading Google Maps API...');
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places']
        });
        
        loaderRef.current = loader;

        await loader.load();
        console.log('Google Maps API loaded successfully');
        setIsGoogleLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Places API:', error);
        setIsGoogleLoaded(false);
      } finally {
        isInitializingRef.current = false;
      }
    };

    initializeGooglePlaces();

    // Cleanup function
    return () => {
      // Clean up loader
      if (loaderRef.current) {
        try {
          // The Loader doesn't have a cleanup method, but we can clear our reference
          loaderRef.current = null;
        } catch (error) {
          console.error('Error cleaning up Google Maps loader:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    console.log('useEffect for autocomplete - isGoogleLoaded:', isGoogleLoaded, 'inputRef.current:', !!inputRef.current, 'autocompleteRef.current:', !!autocompleteRef.current, 'window.google:', !!window.google);
    
    if (isGoogleLoaded && inputRef.current && window.google) {
      // Clean up existing autocomplete if it exists
      if (autocompleteRef.current && window.google) {
        try {
          console.log('Cleaning up existing autocomplete listeners');
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        } catch (error) {
          console.error('Error cleaning up existing autocomplete:', error);
        }
      }
      
      try {
        console.log('Initializing Google Places Autocomplete...');
        // Initialize autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' }, // Restrict to US addresses
          fields: ['formatted_address', 'address_components', 'geometry']
        });

        console.log('Autocomplete initialized, adding place_changed listener...');

        // Handle place selection
        const placeChangedListener = () => {
          console.log('place_changed event fired');
          
          try {
            const place = autocompleteRef.current?.getPlace();
            console.log('Place object:', place);
            
            if (place && place.address_components) {
              // Build complete address with zipcode
              let streetNumber = '';
              let route = '';
              let locality = '';
              let administrativeArea = '';
              let postalCode = '';
              
              place.address_components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('street_number')) {
                  streetNumber = component.long_name;
                } else if (types.includes('route')) {
                  route = component.long_name;
                } else if (types.includes('locality')) {
                  locality = component.long_name;
                } else if (types.includes('administrative_area_level_1')) {
                  administrativeArea = component.short_name;
                } else if (types.includes('postal_code')) {
                  postalCode = component.long_name;
                }
              });
              
              // Build complete address
              const completeAddress = [streetNumber, route, locality, administrativeArea, postalCode]
                .filter(part => part)
                .join(', ');
              
              console.log('Complete address built:', completeAddress);
              
              if (completeAddress) {
                // Clear any pending debounce timeout when address is selected from dropdown
                if (debounceTimeoutRef.current) {
                  clearTimeout(debounceTimeoutRef.current);
                  debounceTimeoutRef.current = null;
                }
                
                // Immediately update the input value and trigger callbacks
                onChange(completeAddress);
                if (onAddressSelected) {
                  console.log('Calling onAddressSelected callback with complete address');
                  onAddressSelected(completeAddress);
                }
              } else if (place.formatted_address) {
                // Clear any pending debounce timeout when address is selected from dropdown
                if (debounceTimeoutRef.current) {
                  clearTimeout(debounceTimeoutRef.current);
                  debounceTimeoutRef.current = null;
                }
                
                // Fallback to formatted_address if building fails
                console.log('Using formatted_address as fallback:', place.formatted_address);
                onChange(place.formatted_address);
                if (onAddressSelected) {
                  onAddressSelected(place.formatted_address);
                }
              }
            } else {
              console.log('No address_components found in place object');
            }
          } catch (error) {
            console.error('Error in place_changed listener:', error);
          }
        };
        
        console.log('Adding place_changed listener to autocomplete:', autocompleteRef.current);
        autocompleteRef.current.addListener('place_changed', placeChangedListener);
        
        console.log('place_changed listener added successfully');
      } catch (error) {
        console.error('Error initializing Google Places Autocomplete:', error);
        setIsGoogleLoaded(false);
      }
    } else {
      console.log('Autocomplete initialization skipped - conditions not met');
    }

    return () => {
      try {
        if (autocompleteRef.current && window.google) {
          console.log('Cleaning up autocomplete listeners');
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        }
      } catch (error) {
        console.error('Error cleaning up autocomplete listeners:', error);
      }
      
      // Clean up debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
    };
  }, [isGoogleLoaded, onChange, onAddressSelected]);

  // Debounced function to trigger address selection after user stops typing
  const debouncedAddressSelection = useCallback((address: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      // Only trigger if address is substantial enough (at least 10 characters like the API expects)
      if (address.trim().length >= 10 && onAddressSelected) {
        console.log('Debounced address selection triggered for:', address);
        onAddressSelected(address);
      }
    }, 1000); // Wait 1 second after user stops typing
  }, [onAddressSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Input change event:', newValue);
    onChange(newValue);
    
    // Only trigger debounced address selection for manual typing
    // Let Google Places handle its own selections
    debouncedAddressSelection(newValue);
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Prevent default to avoid any potential conflicts with Google Places
    e.preventDefault();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ensure the input is properly focused for Google Places
    e.target.focus();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Allow normal blur behavior
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow normal key behavior for Google Places
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Enter address..."}
        className={className}
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
