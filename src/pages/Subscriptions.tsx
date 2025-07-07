import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Phone } from 'lucide-react';

const Subscriptions = () => {
  const navigate = useNavigate();

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

  const handleSubscriptionClick = (planName: string, planPrice: string, planPeriod: string) => {
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
                  onClick={() => handleSubscriptionClick(plan.name, plan.price, plan.period)}
                >
                  {plan.isContactPlan && <Phone className="h-4 w-4 mr-2" />}
                  {plan.buttonText}
                </Button>
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
