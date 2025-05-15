
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/41971a8a-631f-46dc-bd50-7845e8f464c6.png" 
              alt="GovMetric Logo" 
              className="h-8" 
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/dashboard">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full text-center space-y-8">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/41971a8a-631f-46dc-bd50-7845e8f464c6.png" 
              alt="GovMetric Logo" 
              className="mx-auto h-16" 
            />
            <h1 className="text-4xl font-bold mt-6 text-gray-800">
              Municipal Lien Search Platform
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Comprehensive lien searches for real estate transactions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              title="Fast Turnaround" 
              description="Get your lien search results quickly to close deals faster."
            />
            <FeatureCard 
              title="Comprehensive Data" 
              description="Our searches include all municipal debts, liens, and violations."
            />
            <FeatureCard 
              title="Expert Support" 
              description="Our team of experts is ready to assist with any questions."
            />
          </div>
          
          <div className="mt-12">
            <Button size="lg" asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/41971a8a-631f-46dc-bd50-7845e8f464c6.png" 
                alt="GovMetric Logo" 
                className="h-8" 
              />
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="#" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link to="#" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <Link to="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link>
              <Link to="#" className="text-gray-600 hover:text-gray-900">Terms of Service</Link>
            </div>
          </div>
          <div className="text-center mt-6 text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} GovMetric Municipal Lien Search. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Index;
