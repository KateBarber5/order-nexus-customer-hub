
import React, { useState, useEffect } from 'react';
import { mockCustomer, Customer } from '@/data/mockData';
import { getUserProfile, updateUserProfile, changeUserPassword, UserProfileResponse } from '@/services/orderService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Lock, CreditCard, Calendar, User, Loader2 } from 'lucide-react';

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [customer, setCustomer] = useState<Customer>(mockCustomer);
  const [formData, setFormData] = useState<Customer>(mockCustomer);
  const [organizationName, setOrganizationName] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  
  // Mock subscription data
  const [subscriptionData] = useState({
    plan: 'Retail',
    ordersUsed: 8,
    ordersTotal: 25,
    nextBillingDate: '2025-08-01',
    amount: '$199',
    status: 'Active'
  });

  // Mock stored card data (last 4 digits)
  const [storedCard] = useState({
    last4: '4242',
    brand: 'Visa',
    expiryMonth: '12',
    expiryYear: '2027'
  });

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // Load user profile data from API
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const userProfile = await getUserProfile();
        
        // Transform API response to match the component's expected format
        const transformedCustomer = {
          id: userProfile.UserId, // Use UserId from API response
          name: userProfile.FullName || '',
          email: userProfile.Email || '',
          phone: userProfile.Phone || '',
          address: userProfile.Address || '',
          city: userProfile.City || '',
          state: userProfile.State || '',
          zipCode: userProfile.PostCode || ''
        };
        
        setCustomer(transformedCustomer);
        setFormData(transformedCustomer);
        setOrganizationName(userProfile.OrganizationName || '');
        
        console.log('User profile loaded successfully:', transformedCustomer);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
        toast.error('Failed to load user profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Call the API to update the user profile
      const response = await updateUserProfile({
        id: formData.id,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        phone: formData.phone,
        state: formData.state,
        zipCode: formData.zipCode
      });
      
      // Check for success messages in the response
      if (response.oMessages && Array.isArray(response.oMessages)) {
        const successMessages = response.oMessages.filter(msg => msg.Type === 2);
        if (successMessages.length > 0) {
          // Update local state
          setCustomer(formData);
          setIsEditing(false);
          toast.success(successMessages[0].Description || 'Profile updated successfully!');
        } else {
          // No success messages found
          toast.error('Failed to update profile. Please try again.');
        }
      } else {
        // Update local state
        setCustomer(formData);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile. Please try again.');
    }
  };
  
  const handleCancel = () => {
    setFormData(customer);
    setIsEditing(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      // Call the API to change the password
      const response = await changeUserPassword(formData.id, passwords.newPassword);
      
      // Check for success messages in the response
      if (response.oMessages && Array.isArray(response.oMessages)) {
        const successMessages = response.oMessages.filter(msg => msg.Type === 2);
        if (successMessages.length > 0) {
          toast.success(successMessages[0].Description || 'Password changed successfully!');
          setIsDialogOpen(false);
          setPasswords({ newPassword: '', confirmPassword: '' });
          setPasswordError('');
        } else {
          // No success messages found
          toast.error('Failed to change password. Please try again.');
        }
      } else {
        toast.success('Password changed successfully!');
        setIsDialogOpen(false);
        setPasswords({ newPassword: '', confirmPassword: '' });
        setPasswordError('');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password. Please try again.');
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Credit card updated successfully!');
    setCardData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Loading your profile information...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
            Error loading profile
          </CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <p className="text-destructive">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Manage your personal information
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organizationName">Organization Name</Label>
                    <Input
                      id="organizationName"
                      name="organizationName"
                      value={organizationName}
                      readOnly={true}
                      className="bg-gray-50"
                    />
                  </div>
                  
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
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className={`flex ${isEditing ? "justify-between" : "justify-between"} mt-6`}>
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
                  <>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" type="button">
                          <Lock className="mr-2 h-4 w-4" />
                          Change Password
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Change Password</DialogTitle>
                          <DialogDescription>
                            Enter your new password below. Password must be at least 8 characters long.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              value={passwords.newPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              value={passwords.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>
                          {passwordError && (
                            <p className="text-sm font-medium text-destructive">{passwordError}</p>
                          )}
                          <DialogFooter>
                            <Button type="submit">Update Password</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  </>
                )}
              </div>
            </form>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Plan</Label>
                    <p className="text-lg font-semibold text-blue-600">{subscriptionData.plan}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <p className="text-lg font-semibold text-green-600">{subscriptionData.status}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Monthly Cost</Label>
                    <p className="text-lg font-semibold">{subscriptionData.amount}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Next Billing Date</Label>
                    <p className="text-lg font-semibold">{subscriptionData.nextBillingDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders Usage</CardTitle>
                <CardDescription>Track your monthly order usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Orders Used</span>
                    <span className="text-sm font-bold">
                      {subscriptionData.ordersUsed} / {subscriptionData.ordersTotal}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(subscriptionData.ordersUsed / subscriptionData.ordersTotal) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    You have {subscriptionData.ordersTotal - subscriptionData.ordersUsed} orders remaining this month
                  </p>
                  <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                    Any orders exceeding the monthly limit will be charged the flat rate of $10 per order.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Credit Card Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>Update your credit card information</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Current Card Display */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-8 w-8 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {storedCard.brand} ending in {storedCard.last4}
                        </p>
                        <p className="text-sm text-gray-600">
                          Expires {storedCard.expiryMonth}/{storedCard.expiryYear}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Current Card
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCardSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Cardholder Name</Label>
                      <Input
                        id="cardholderName"
                        name="cardholderName"
                        value={cardData.cardholderName}
                        onChange={handleCardChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleCardChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        value={cardData.expiryDate}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="default">
                      Update Card
                    </Button>
                    <Button type="button" variant="outline">
                      Manage Subscription
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CustomerProfile;
