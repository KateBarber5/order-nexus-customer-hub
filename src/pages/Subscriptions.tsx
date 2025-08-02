import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Phone, Loader2 } from 'lucide-react';
import { getOrganizations, sessionManager } from '@/services/orderService';
import { toast } from '@/components/ui/sonner';

const Subscriptions = () => {
  const navigate = useNavigate();
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const plans = [
    {
      name: 'Per Order',
      price: '$10',
      period: 'per order',
      description: 'Pay as you go - perfect for occasional use',
      features: [
        'Pay only when you place an order',
        'No monthly commitment',
        'All standard features included',
        'Email support'
      ],
      color: 'border-gray-200 bg-gray-50',
      buttonColor: 'default',
      buttonText: 'Start Ordering'
    },
    {
      name: 'Retail',
      price: '$199',
      period: 'per month',
      description: 'Perfect for small to medium businesses',
      features: [
        '25 orders per month',
        'All standard features',
        'Priority email support',
        'Monthly usage reports'
      ],
      color: 'border-blue-200 bg-blue-50',
      buttonColor: 'default',
      buttonText: 'Choose Retail',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$500',
      period: 'per month',
      description: 'Ideal for large organizations with high volume needs',
      features: [
        '75 orders per month',
        'All premium features',
        'Priority phone & email support',
        'Custom reporting',
        'Dedicated account manager'
      ],
      color: 'border-green-200 bg-green-50',
      buttonColor: 'green',
      buttonText: 'Choose Enterprise'
    },
    {
      name: 'Organization',
      price: 'Custom',
      period: 'pricing',
      description: 'Tailored solutions for enterprise organizations',
      features: [
        'Unlimited orders',
        'Custom integrations',
        'White-label options',
        '24/7 dedicated support',
        'Custom SLAs',
        'On-site training'
      ],
      color: 'border-purple-200 bg-purple-50',
      buttonColor: 'outline',
      buttonText: 'Contact Sales',
      isContactPlan: true
    }
  ];

  // Load current user's organization data
  useEffect(() => {
    const loadOrganizationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the current organization ID from session
        const organizationId = sessionManager.getCurrentOrganizationID();
        
        if (!organizationId) {
          console.warn('No organization ID found in session');
          setError('No organization ID found. Please log in again.');
          return;
        }
        
        // Call the GetOrganizations API
        const organizations = await getOrganizations();
        
        // Find the organization that matches the current user's organization
        const userOrganization = organizations.find(org => org.OrganizationID === organizationId);
        
        if (userOrganization) {
          setCurrentPlan(userOrganization.OrganizationPlan);
          console.log('Current plan loaded:', userOrganization.OrganizationPlan);
        } else {
          console.warn('User organization not found in organizations list');
          setError('Could not find your organization data.');
        }
      } catch (err) {
        console.error('Error loading organization data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load organization data');
        toast.error('Failed to load subscription data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationData();
  }, []);

  const handleSubscriptionClick = (planName: string, planPrice: string, planPeriod: string) => {
    // Don't allow clicking on the current plan
    if (planName === currentPlan) {
      toast.info('This is your current plan');
      return;
    }
    
    if (planName === 'Organization') {
      // Handle contact sales
      console.log('Contact sales for Organization plan');
      // You could open a modal, redirect to contact form, etc.
    } else {
      // Navigate to billing page with plan details
      navigate('/billing', {
        state: {
          planName,
          planPrice,
          planPeriod
        }
      });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Subscription Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Loading your current subscription information...
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading subscription data...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Subscription Plan
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Error loading subscription data
            </p>
          </div>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Subscription Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your organization's needs. All plans include our comprehensive municipal search services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.color} hover:shadow-lg transition-shadow duration-200`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">
                    {plan.period}
                  </span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.buttonColor as any}
                  className="w-full"
                  disabled={plan.name === currentPlan}
                  onClick={() => handleSubscriptionClick(plan.name, plan.price, plan.period)}
                >
                  {plan.isContactPlan && <Phone className="h-4 w-4 mr-2" />}
                  {plan.name === currentPlan ? 'Current Plan' : plan.buttonText}
                </Button>
                {plan.name === currentPlan && (
                  <p className="text-sm text-green-600 font-medium text-center mt-2">
                    This is your current plan
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Need help choosing the right plan? Our team is here to help.
          </p>
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Contact Our Sales Team
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Subscriptions;
