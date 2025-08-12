
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const isAutocompleteSelectionRef = useRef(false);
  const hasActiveDropdownRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const onAddressSelectedRef = useRef(onAddressSelected);

  // Update refs when props change
  useEffect(() => {
    onChangeRef.current = onChange;
    onAddressSelectedRef.current = onAddressSelected;
  }, [onChange, onAddressSelected]);

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
        // Initialize autocomplete with specific settings for consistent results
        const options: google.maps.places.AutocompleteOptions = {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: [
            'formatted_address',
            'address_components',
            'geometry',
            'place_id',
            'types'
          ]
        };

        // Create a session token for consistent results
        const sessionToken = new google.maps.places.AutocompleteSessionToken();

        // Initialize autocomplete with options
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, options);
        
        // @ts-ignore - sessionToken is a valid option but not in the type definitions
        autocompleteRef.current.setOptions({ sessionToken });

        console.log('Autocomplete initialized, adding place_changed listener...');

        // Helper function to process place details and build complete address
        const processPlaceDetails = async (placeDetails: google.maps.places.PlaceResult) => {
          console.log('Processing place details:', placeDetails);
          
          if (placeDetails.address_components) {
            // Build complete address with zipcode
            let streetNumber = '';
            let route = '';
            let locality = '';
            let administrativeArea = '';
            let postalCode = '';
            
            console.log('Processing address components:', placeDetails.address_components);
            
            placeDetails.address_components.forEach((component: any) => {
              const types = component.types;
              console.log('Component:', { types, long_name: component.long_name, short_name: component.short_name });
              
              if (types.includes('street_number')) {
                streetNumber = component.long_name;
                console.log('Found street number:', streetNumber);
              } else if (types.includes('route')) {
                route = component.long_name;
                console.log('Found route:', route);
              } else if (types.includes('locality')) {
                locality = component.long_name;
                console.log('Found locality:', locality);
              } else if (types.includes('administrative_area_level_1')) {
                administrativeArea = component.short_name;
                console.log('Found state:', administrativeArea);
              } else if (types.includes('postal_code')) {
                postalCode = component.long_name;
                console.log('Found postal code:', postalCode);
              }
            });
            
            // Only proceed if we have all required components
            if (!streetNumber || !route || !locality || !administrativeArea) {
              console.log('Missing required address components');
              return;
            }
            
            // Build complete address with proper formatting
            const completeAddress = postalCode
              ? `${streetNumber} ${route}, ${locality}, ${administrativeArea}, ${postalCode}`
              : `${streetNumber} ${route}, ${locality}, ${administrativeArea}`;
            
            console.log('Complete address built:', completeAddress);
            
            if (completeAddress) {
              // Clear any pending debounce timeout when address is selected from dropdown
              if (debounceTimeoutRef.current) {
                console.log('Clearing debounce timeout due to autocomplete selection');
                clearTimeout(debounceTimeoutRef.current);
                debounceTimeoutRef.current = null;
              }
              
              // Set flag to indicate this is an autocomplete selection
              isAutocompleteSelectionRef.current = true;
              hasActiveDropdownRef.current = false; // Dropdown is closing
              
              // Immediately update the input value and trigger callbacks
              console.log('Selected address from autocomplete:', completeAddress);
              onChangeRef.current(completeAddress);
              
              // Always trigger onAddressSelected immediately for autocomplete selections
              if (onAddressSelectedRef.current) {
                console.log('Calling onAddressSelected callback with complete address');
                // Use setTimeout to ensure the onChange has been processed first
                setTimeout(() => {
                  onAddressSelectedRef.current!(completeAddress);
                  // Reset the flag after a short delay
                  setTimeout(() => {
                    isAutocompleteSelectionRef.current = false;
                  }, 100);
                }, 0);
              }
            } else {
              console.error('Failed to build complete address from components');
            }
          } else {
            console.log('No address_components found in place object');
          }
        };

        // Handle place selection
        const placeChangedListener = async () => {
          console.log('place_changed event fired');
          
          try {
            const place = autocompleteRef.current?.getPlace();
            console.log('Initial place object:', place);
            
            // If we don't have a place_id, try to get it from the input value
            if (!place || !place.place_id) {
              console.log('No valid place selected, checking input value');
              
              // If we have a substantial address in the input, try to geocode it
              if (value && value.length > 10) {
                console.log('Attempting to geocode input value:', value);
                try {
                  const geocoder = new window.google.maps.Geocoder();
                  const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
                    geocoder.geocode({ address: value }, (results, status) => {
                      if (status === google.maps.GeocoderStatus.OK && results) {
                        resolve(results);
                      } else {
                        reject(new Error(`Geocoding failed: ${status}`));
                      }
                    });
                  });
                  
                  if (result && result.length > 0) {
                    console.log('Geocoding successful, using first result');
                    const geocodedPlace = result[0];
                    
                    // Process the geocoded result
                    if (geocodedPlace.place_id) {
                      // Get detailed place information using Places Details
                      const placeDetails = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
                        const service = new google.maps.places.PlacesService(document.createElement('div'));
                        service.getDetails(
                          {
                            placeId: geocodedPlace.place_id,
                            fields: [
                              'address_components',
                              'formatted_address',
                              'geometry',
                              'place_id',
                              'types'
                            ]
                          },
                          (result, status) => {
                            if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                              resolve(result);
                            } else {
                              reject(new Error(`Place details request failed: ${status}`));
                            }
                          }
                        );
                      });
                      
                      // Process the place details
                      await processPlaceDetails(placeDetails);
                    }
                  }
                } catch (error) {
                  console.error('Geocoding failed:', error);
                }
              }
              return;
            }
            
            // Get detailed place information using Places Details with all address components
            const placeDetails = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
              const service = new google.maps.places.PlacesService(document.createElement('div'));
              service.getDetails(
                {
                  placeId: place.place_id,
                  fields: [
                    'address_components',
                    'formatted_address',
                    'geometry',
                    'place_id',
                    'types'
                  ]
                },
                (result, status) => {
                  if (status === google.maps.places.PlacesServiceStatus.OK && result) {
                    resolve(result);
                  } else {
                    reject(new Error(`Place details request failed: ${status}`));
                  }
                }
              );
            });
            
            // Process the place details
            await processPlaceDetails(placeDetails);
          } catch (error) {
            console.error('Error in place_changed listener:', error);
          }
        };
        
        console.log('Adding place_changed listener to autocomplete:', autocompleteRef.current);
        autocompleteRef.current.addListener('place_changed', placeChangedListener);
        
        // Add listeners to detect when dropdown is shown/hidden
        const inputElement = inputRef.current;
        if (inputElement) {
          // Listen for focus to potentially show dropdown
          const focusListener = () => {
            console.log('Input focused, dropdown may appear');
          };
          
          // Listen for input events that might show the dropdown
          const inputListener = () => {
            if (value.length > 2) {
              hasActiveDropdownRef.current = true;
              console.log('Dropdown likely active due to input length');
            }
          };
          
          // Listen for blur to hide dropdown
          const blurListener = () => {
            // Add a small delay to allow for dropdown clicks
            setTimeout(() => {
              hasActiveDropdownRef.current = false;
              console.log('Dropdown likely hidden due to blur');
            }, 200);
          };
          
          inputElement.addEventListener('focus', focusListener);
          inputElement.addEventListener('input', inputListener);
          inputElement.addEventListener('blur', blurListener);
          
          // Cleanup function will handle removing these listeners
        }
        
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
  }, [isGoogleLoaded]); // Remove onChange and onAddressSelected from dependencies

  // Debounced function to trigger address selection after user stops typing
  const debouncedAddressSelection = useCallback((address: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      // Only trigger if address is substantial enough AND no dropdown is active
      if (address.trim().length >= 10 && onAddressSelectedRef.current && !hasActiveDropdownRef.current) {
        console.log('Debounced address selection triggered for:', address);
        onAddressSelectedRef.current(address);
      } else if (hasActiveDropdownRef.current) {
        console.log('Skipping debounced validation - dropdown is active');
      }
    }, 2000); // Increased to 2 seconds to give users more time to type
  }, []); // Remove onAddressSelected dependency

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('Input change event:', newValue, 'isAutocompleteSelection:', isAutocompleteSelectionRef.current);
    onChangeRef.current(newValue);
    
    // Set dropdown as potentially active when typing
    if (newValue.length > 2 && !isAutocompleteSelectionRef.current) {
      hasActiveDropdownRef.current = true;
    }
    
    // Only trigger debounced address selection for manual typing when not from autocomplete
    if (!isAutocompleteSelectionRef.current) {
      console.log('Triggering debounced address selection for manual typing');
      debouncedAddressSelection(newValue);
    } else {
      console.log('Skipping debounced selection - this is from autocomplete');
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Ensure the input is properly focused and autocomplete is activated
    e.currentTarget.focus();
    
    // If there's a value and autocomplete is available, trigger a search
    if (value && autocompleteRef.current && window.google) {
      console.log('Input clicked, ensuring autocomplete is active');
      // Trigger a focus event to ensure autocomplete is properly initialized
      window.google.maps.event.trigger(autocompleteRef.current, 'focus');
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ensure the input is properly focused for Google Places
    e.target.focus();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Allow normal blur behavior
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle keyboard navigation for Google Places Autocomplete
    if (e.key === 'Enter' && autocompleteRef.current) {
      // Prevent default to avoid form submission
      e.preventDefault();
      
      // Get the currently selected place
      const place = autocompleteRef.current.getPlace();
      if (place && place.place_id) {
        console.log('Enter key pressed, triggering place selection');
        // Trigger the place_changed event manually
        if (window.google) {
          window.google.maps.event.trigger(autocompleteRef.current, 'place_changed');
        }
      }
    }
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
        className={cn("h-9", className)} // Reduced height from default
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
