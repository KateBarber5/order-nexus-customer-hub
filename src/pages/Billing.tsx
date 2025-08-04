import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, CreditCard, Calendar, Lock, Building } from 'lucide-react';
import { updatePaymentInformation, updateBillingInformation, getPaymentInformation, getBillingInformation, updateOrganizationSubscription } from '@/services/orderService';
import { sessionManager } from '@/services/orderService';

const Billing = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the selected plan from navigation state
  const selectedPlan = location.state?.planName || 'Selected Plan';
  const selectedPrice = location.state?.planPrice || 'Custom';
  const selectedPeriod = location.state?.planPeriod || 'pricing';

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    // Credit Card fields
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    // ACH fields
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
    accountHolderName: '',
    // Shared billing address fields
    billingAddress: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load existing payment and billing information when component mounts
  useEffect(() => {
    const loadPaymentAndBillingInformation = async () => {
      try {
        const organizationID = sessionManager.getCurrentOrganizationID();
        
        if (!organizationID) {
          console.error('No organization ID found in session');
          setIsLoading(false);
          return;
        }

        console.log('Loading payment and billing information for organization:', organizationID);
        
        // Load payment information
        const paymentInfo = await getPaymentInformation(organizationID);
        console.log('Loaded payment information:', paymentInfo);
        
        // Load billing information
        const billingInfo = await getBillingInformation(organizationID);
        console.log('Loaded billing information:', billingInfo);
        
        // Set payment method based on OrganizationPaymentMethodType
        if (paymentInfo.OrganizationPaymentMethodType === 'ACH Bank Transfer') {
          setPaymentMethod('ach');
        } else {
          setPaymentMethod('card');
        }
        
        // Update form data with existing payment and billing information
        setFormData(prev => ({
          ...prev,
          // ACH fields
          accountNumber: paymentInfo.OrganizationAccountNumber || '',
          routingNumber: paymentInfo.OrganizationRoutingNumber || '',
          accountType: paymentInfo.OrganizationAccountType?.toLowerCase() === 'savings' ? 'savings' : 'checking',
          accountHolderName: paymentInfo.OrganizationAccountHolderName || '',
          // Credit card fields (if any exist, they would be populated here)
          cardholderName: paymentInfo.OrganizationAccountHolderName || '', // Use account holder name as fallback
          // Billing address fields
          billingAddress: billingInfo.OrganizationBillingAddress || '',
          city: billingInfo.OrganizationBillingCity || '',
          state: billingInfo.OrganizationBillingState || '',
          zipCode: billingInfo.OrganizationBillingPostCode || '',
        }));
        
      } catch (error) {
        console.error('Error loading payment and billing information:', error);
        // Don't show alert for loading errors, just log them
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentAndBillingInformation();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Get organization ID from current user session
      const organizationID = sessionManager.getCurrentOrganizationID();
      
      if (!organizationID) {
        console.error('No organization ID found in session');
        alert('Please log in again to continue.');
        return;
      }
      
      console.log('Processing payment for:', selectedPlan, 'Method:', paymentMethod, formData);
      
      // Update billing information for both payment methods
      try {
        const billingResult = await updateBillingInformation({
          organizationID: organizationID,
          postCode: formData.zipCode,
          address: formData.billingAddress,
          city: formData.city,
          state: formData.state
        });
        
        if (billingResult.oMessages && billingResult.oMessages.some(msg => msg.Type === 2)) {
          console.log('Billing information updated successfully');
        } else {
          console.error('Failed to update billing information');
          alert('Failed to update billing information. Please try again.');
          return;
        }
      } catch (billingError) {
        console.error('Error updating billing information:', billingError);
        alert('Failed to update billing information. Please try again.');
        return;
      }
      
      // Handle ACH Bank Transfer payment method
      if (paymentMethod === 'ach') {
        try {
          // Call the UpdatePaymentInformation API
          const paymentResult = await updatePaymentInformation({
            organizationID: organizationID,
            accountNumber: formData.accountNumber,
            paymentMethodType: "ACH Bank Transfer",
            accountHolderName: formData.accountHolderName,
            accountType: formData.accountType === 'checking' ? 'Checking' : 'Savings',
            routingNumber: formData.routingNumber
          });
          
          // Check if the API call was successful
          if (paymentResult.oMessages && paymentResult.oMessages.some(msg => msg.Type === 2)) {
            console.log('Payment information updated successfully');
            
            // Update organization subscription
            try {
              const subscriptionResult = await updateOrganizationSubscription({
                OrganizationID: organizationID,
                OrganizationPlan: selectedPlan,
                OrganizationName: '',
                OrganizationPlanMonthlyPrice: '',
                OrganizationPlanMonthlyOrders: 0,
                OrganizationPlanUsedOrders: 0,
                OrganizationPlanRemainingOrders: 0,
                OrganizationPlanExcessOrderCost: '',
                OrganizationPlanNextBillingDate: '',
                OrganizationPlanStatus: ''
              });
              
              if (subscriptionResult.oMessages && subscriptionResult.oMessages.some(msg => msg.Type === 2)) {
                console.log('Organization subscription updated successfully');
                alert('Payment, billing, and subscription information updated successfully!');
                // Redirect to success page or dashboard
                navigate('/dashboard');
              } else {
                console.error('Failed to update organization subscription');
                alert('Payment and billing updated, but failed to update subscription. Please contact support.');
                navigate('/dashboard');
              }
            } catch (subscriptionError) {
              console.error('Error updating organization subscription:', subscriptionError);
              alert('Payment and billing updated, but failed to update subscription. Please contact support.');
              navigate('/dashboard');
            }
          } else {
            console.error('Failed to update payment information');
            alert('Failed to update payment information. Please try again.');
          }
        } catch (paymentError) {
          console.error('Error updating payment information:', paymentError);
          alert('Failed to update payment information. Please try again.');
        }
      } else {
        // Handle credit card payment method
        console.log('Processing credit card payment for:', selectedPlan, 'Method:', paymentMethod, formData);
        
        // Update organization subscription for credit card payments
        try {
          const subscriptionResult = await updateOrganizationSubscription({
            OrganizationID: organizationID,
            OrganizationPlan: selectedPlan,
            OrganizationName: '',
            OrganizationPlanMonthlyPrice: '',
            OrganizationPlanMonthlyOrders: 0,
            OrganizationPlanUsedOrders: 0,
            OrganizationPlanRemainingOrders: 0,
            OrganizationPlanExcessOrderCost: '',
            OrganizationPlanNextBillingDate: '',
            OrganizationPlanStatus: 'Active'
          });
          
          if (subscriptionResult.oMessages && subscriptionResult.oMessages.some(msg => msg.Type === 2)) {
            console.log('Organization subscription updated successfully');
            alert('Billing and subscription information updated successfully! Credit card payment processing not yet implemented.');
            navigate('/dashboard');
          } else {
            console.error('Failed to update organization subscription');
            alert('Billing updated, but failed to update subscription. Please contact support.');
            navigate('/dashboard');
          }
        } catch (subscriptionError) {
          console.error('Error updating organization subscription:', subscriptionError);
          alert('Billing updated, but failed to update subscription. Please contact support.');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred while processing your payment. Please try again.');
    }
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
                Choose your payment method and enter your details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment information...</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center cursor-pointer">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Credit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ach" id="ach" />
                      <Label htmlFor="ach" className="flex items-center cursor-pointer">
                        <Building className="h-4 w-4 mr-2" />
                        ACH Bank Transfer
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Credit Card Information */}
                {paymentMethod === 'card' && (
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
                )}

                {/* ACH Information */}
                {paymentMethod === 'ach' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="accountHolderName">Account Holder Name</Label>
                      <Input
                        id="accountHolderName"
                        name="accountHolderName"
                        value={formData.accountHolderName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="routingNumber">Routing Number</Label>
                      <Input
                        id="routingNumber"
                        name="routingNumber"
                        value={formData.routingNumber}
                        onChange={handleInputChange}
                        placeholder="123456789"
                        maxLength={9}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        placeholder="1234567890"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Account Type</Label>
                      <RadioGroup value={formData.accountType} onValueChange={(value) => setFormData(prev => ({ ...prev, accountType: value }))}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="checking" id="checking" />
                          <Label htmlFor="checking" className="cursor-pointer">Checking</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="savings" id="savings" />
                          <Label htmlFor="savings" className="cursor-pointer">Savings</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> ACH payments may take 3-5 business days to process. Your subscription will be activated once payment is confirmed.
                      </p>
                    </div>
                  </div>
                )}

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
              )}
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
