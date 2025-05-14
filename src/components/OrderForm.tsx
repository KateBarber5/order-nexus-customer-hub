
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface OrderFormData {
  address: string;
  parcelId: string;
  county: string;
  productType: 'full' | 'card';
}

const OrderForm = () => {
  const [formData, setFormData] = useState<OrderFormData>({
    address: '',
    parcelId: '',
    county: '',
    productType: 'full'
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductTypeChange = (value: 'full' | 'card') => {
    setFormData(prev => ({
      ...prev,
      productType: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Order submitted:', formData);
      toast.success('Municipal lien search order submitted successfully!');
      
      // Reset form
      setFormData({
        address: '',
        parcelId: '',
        county: '',
        productType: 'full'
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
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Product Type</Label>
            <RadioGroup 
              value={formData.productType} 
              onValueChange={(value) => handleProductTypeChange(value as 'full' | 'card')}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-md p-4 hover:border-primary">
                <RadioGroupItem value="full" id="full-report" />
                <Label htmlFor="full-report" className="font-medium cursor-pointer flex-1">
                  <div>Full Report</div>
                  <p className="font-normal text-sm text-muted-foreground">Comprehensive search with complete details</p>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-4 hover:border-primary">
                <RadioGroupItem value="card" id="card-report" />
                <Label htmlFor="card-report" className="font-medium cursor-pointer flex-1">
                  <div>Card Report</div>
                  <p className="font-normal text-sm text-muted-foreground">Summary report with essential information</p>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
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
            className="w-full md:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Order'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default OrderForm;
