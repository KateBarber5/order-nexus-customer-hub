
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

interface OrderFormData {
  address: string;
  parcelId: string;
  county: string;
}

const OrderForm = () => {
  const [formData, setFormData] = useState<OrderFormData>({
    address: '',
    parcelId: '',
    county: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Search request submitted:', formData);
      toast.success('Lien search request submitted successfully!');
      
      // Reset form
      setFormData({
        address: '',
        parcelId: '',
        county: ''
      });
      
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Municipal Lien Search</CardTitle>
        <CardDescription>
          Fill out the form below to request a new municipal lien search
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Property Address</Label>
            <Textarea
              id="address"
              name="address"
              placeholder="Enter complete property address"
              value={formData.address}
              onChange={handleChange}
              required
              className="min-h-[100px]"
            />
          </div>
          
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
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Search Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OrderForm;
