
import React, { useState } from 'react';
import { mockCustomer } from '@/data/mockData';
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
import { Lock, CreditCard, Calendar, User } from 'lucide-react';

const CustomerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [customer, setCustomer] = useState(mockCustomer);
  const [formData, setFormData] = useState(mockCustomer);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    toast.success('Password changed successfully!');
    setIsDialogOpen(false);
    setPasswords({ newPassword: '', confirmPassword: '' });
    setPasswordError('');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Profile</CardTitle>
        <CardDescription>
          Manage your personal information and subscription
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
            {/* Subscription Overview */}
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

            {/* Orders Usage */}
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
