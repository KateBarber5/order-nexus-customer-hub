
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { FileSearch } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f6f8fa]">
      <div className="w-full max-w-md px-4">
        <Card className="border-0 shadow-lg rounded-xl overflow-hidden">
          <div className="bg-primary py-6 px-8 text-center">
            <div className="flex justify-center mb-4">
              <FileSearch className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">
              GovMetric Municipal Lien Search
            </h1>
          </div>
          
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-gray-600">
                  Sign in to access your account
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="Enter your password" />
                </div>
                
                <div className="pt-2">
                  <Button asChild className="w-full py-5 rounded-md">
                    <Link to="/dashboard">Sign In</Link>
                  </Button>
                </div>
                
                <div className="text-center">
                  <Button variant="link" asChild className="text-primary">
                    <Link to="/dashboard">Forgot Password?</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account? <Button variant="link" asChild className="text-primary p-0">
              <Link to="/dashboard">Create Account</Link>
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
