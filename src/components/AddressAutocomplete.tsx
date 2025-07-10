
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder,
  className,
  isLoading
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const initializeGooglePlaces = async () => {
      try {
        // Note: You'll need to set up a Google API key in your project
        const loader = new Loader({
          apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        setIsGoogleLoaded(true);
      } catch (error) {
        console.error('Failed to load Google Places API:', error);
      }
    };

    initializeGooglePlaces();
  }, []);

  useEffect(() => {
    if (isGoogleLoaded && textareaRef.current && !autocompleteRef.current && window.google) {
      // Initialize autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(textareaRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses
        fields: ['formatted_address', 'address_components', 'geometry']
      });

      // Handle place selection
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    }

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isGoogleLoaded, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        disabled={!isGoogleLoaded}
      />
      {(isLoading || !isGoogleLoaded) && (
        <div className="absolute right-3 top-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>
      )}
      {!isGoogleLoaded && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-md">
          <span className="text-sm text-gray-600">Loading address autocomplete...</span>
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
