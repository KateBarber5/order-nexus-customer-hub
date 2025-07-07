
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Calendar, Lock } from 'lucide-react';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the selected plan from navigation state
  const selectedPlan = location.state?.planName || 'Selected Plan';
  const selectedPrice = location.state?.planPrice || 'Custom';
  const selectedPeriod = location.state?.planPeriod || 'pricing';

  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle payment processing here
    console.log('Processing payment for:', selectedPlan, formData);
    // Redirect to success page or dashboard
  };

  const calculateProrationInfo = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = daysInMonth - today.getDate() + 1;
    const prorationPercentage = (daysRemaining / daysInMonth) * 100;
    
    return {
      daysRemaining,
      prorationPercentage: Math.round(prorationPercentage)
    };
  };

  const { daysRemaining, prorationPercentage } = calculateProrationInfo();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/subscriptions')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscriptions
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-lg text-gray-600">
            You're subscribing to the <span className="font-semibold">{selectedPlan}</span> plan
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Payment Information
              </CardTitle>
              <CardDescription>
                Enter your credit card details to complete your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Credit Card Information */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      name="cardholderName"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium text-gray-900 mb-3">Billing Address</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="billingAddress">Address</Label>
                      <Input
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        placeholder="123 Main Street"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="NY"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" size="lg">
                  <Lock className="h-4 w-4 mr-2" />
                  Complete Subscription
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Plan Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{selectedPlan} Plan</span>
                    <span className="font-bold">{selectedPrice}/{selectedPeriod}</span>
                  </div>
                  
                  {selectedPlan !== 'Per Order' && selectedPlan !== 'Organization' && (
                    <>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Proration ({prorationPercentage}% of month)</span>
                        <span>{daysRemaining} days remaining</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between font-bold">
                          <span>Due Today</span>
                          <span>
                            ${Math.round((parseInt(selectedPrice.replace('$', '')) * prorationPercentage) / 100)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Billing Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {selectedPlan === 'Per Order' ? (
                    <p className="text-gray-600">
                      You will be charged $10 for each order you place. No monthly fees or commitments.
                    </p>
                  ) : selectedPlan === 'Organization' ? (
                    <p className="text-gray-600">
                      Our team will contact you to discuss custom pricing options that fit your organization's needs.
                    </p>
                  ) : (
                    <>
                      <p className="text-gray-600">
                        <strong>Today:</strong> You'll be billed for the remaining {daysRemaining} days of this month 
                        (${Math.round((parseInt(selectedPrice.replace('$', '')) * prorationPercentage) / 100)}).
                      </p>
                      <p className="text-gray-600">
                        <strong>Going forward:</strong> You'll be billed {selectedPrice} on the 1st of each month.
                      </p>
                      <p className="text-gray-600">
                        You can cancel or modify your subscription at any time from your account settings.
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-green-800 mb-1">Secure Payment</p>
                    <p className="text-green-700">
                      Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
