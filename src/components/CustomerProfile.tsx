
import React, { useState } from 'react';
import { mockCustomer } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [customer, setCustomer] = useState(mockCustomer);
  const [formData, setFormData] = useState(mockCustomer);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomer(formData);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };
  
  const handleCancel = () => {
    setFormData(customer);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Profile</CardTitle>
        <CardDescription>
          View and manage your personal information
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                readOnly={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
                required
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className={`flex ${isEditing ? "justify-between" : "justify-end"}`}>
          {isEditing ? (
            <>
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default CustomerProfile;
