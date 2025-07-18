
import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    const initializeGooglePlaces = async () => {
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

        await loader.load();
        console.log('Google Maps API loaded successfully');
        setIsGoogleLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Places API:', error);
        setIsGoogleLoaded(false);
      }
    };

    initializeGooglePlaces();
  }, []);

  useEffect(() => {
    console.log('useEffect for autocomplete - isGoogleLoaded:', isGoogleLoaded, 'inputRef.current:', !!inputRef.current, 'autocompleteRef.current:', !!autocompleteRef.current, 'window.google:', !!window.google);
    
    if (isGoogleLoaded && inputRef.current && window.google) {
      // Clean up existing autocomplete if it exists
      if (autocompleteRef.current && window.google) {
        console.log('Cleaning up existing autocomplete listeners');
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
      
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
        const place = autocompleteRef.current?.getPlace();
        console.log('Place object:', place);
        if (place && place.formatted_address) {
          console.log('Address selected from autocomplete:', place.formatted_address);
          onChange(place.formatted_address);
          // Trigger the onAddressSelected callback when an address is selected
          if (onAddressSelected) {
            console.log('Calling onAddressSelected callback');
            onAddressSelected(place.formatted_address);
          }
        } else {
          console.log('No formatted_address found in place object');
        }
      };
      
      console.log('Adding place_changed listener to autocomplete:', autocompleteRef.current);
      autocompleteRef.current.addListener('place_changed', placeChangedListener);
      
      console.log('place_changed listener added successfully');
    } else {
      console.log('Autocomplete initialization skipped - conditions not met');
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        console.log('Cleaning up autocomplete listeners');
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isGoogleLoaded, onChange, onAddressSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input change event:', e.target.value);
    onChange(e.target.value);
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    console.log('Input click event');
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    console.log('Input focus event');
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onClick={handleClick}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
