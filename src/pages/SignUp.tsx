
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { FileSearch, Lock, Mail, UserPlus, Building } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { crudAccount, getSystemParameter } from '@/services/orderService';
import { mockOrganizations, mockEmailService } from '@/data/mockData';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOrgDialog, setShowOrgDialog] = useState(false);
  const [existingOrg, setExistingOrg] = useState<{ name: string; adminName: string; adminEmail: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if organization already exists in mock data
    if (companyName) {
      const existingOrganization = mockOrganizations.find(
        org => org.name.toLowerCase() === companyName.toLowerCase()
      );
      
      if (existingOrganization) {
        setExistingOrg({
          name: existingOrganization.name,
          adminName: existingOrganization.adminName,
          adminEmail: existingOrganization.adminEmail
        });
        setShowOrgDialog(true);
        return;
      }
    }

    setIsLoading(true);
    
    try {
      // Fetch the OrganizationAdminRoleId from the API
      const systemParamResponse = await getSystemParameter('OrganizationAdminRoleId');
      const roleId = parseInt(systemParamResponse.WWPParameterValue, 10);
      
      if (isNaN(roleId)) {
        throw new Error('Invalid role ID received from server');
      }
      
      const requestData = {
        iTrnMode: 'INS' as const,
        iAccountSDT: {
          Name: email,
          EMail: email,
          FirstName: firstName,
          LastName: lastName,
          Password: password,
          OrganizationName: companyName || 'Default Organization',
          UserActivationMethod: 'U',
          RoleId: roleId
        }
      };
      
      const response = await crudAccount(requestData);
      
      // Check if the response contains any error messages
      const errorMessage = response.oMessages?.find(msg => msg.Type === 1);
      if (errorMessage) {
        toast({
          title: "Account Creation Failed",
          description: errorMessage.Description,
          variant: "destructive",
        });
        return;
      }
      
      // Check for success message
      const successMessage = response.oMessages?.find(msg => msg.Type === 2);
      if (successMessage) {
        toast({
          title: "Account Request Submitted",
          description: successMessage.Description,
        });
        
        // Clear form on success
        setFirstName('');
        setLastName('');
        setCompanyName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        toast({
          title: "Account Request Submitted",
          description: "Your account request has been submitted for review. You will be notified when your account is approved.",
        });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendJoinRequest = async () => {
    if (!existingOrg) return;
    
    try {
      await mockEmailService.sendOrgJoinRequest(
        { name: existingOrg.adminName, email: existingOrg.adminEmail },
        { firstName, lastName, email }
      );
      
      toast({
        title: "Request Sent",
        description: `We've sent a request to ${existingOrg.adminName} at ${existingOrg.name}. They will review your request and get back to you.`,
      });
      
      setShowOrgDialog(false);
      // Clear form
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#645DF3] via-[#B9BDE7] to-[#BDC0FA] p-4">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#5D56E8]/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#645DF3]/30 rounded-full blur-3xl"></div>
        
        <div className="flex justify-center mb-6 relative z-10">
          <div className="p-2">
            <img src="/lovable-uploads/faa2ec17-b47d-4458-848e-14fbdf899415.png" alt="GovMetric Logo" className="h-16" />
          </div>
        </div>
        
        <Card className="w-full backdrop-blur-sm bg-white/90 border border-white/20 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Organization Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="companyName" 
                    type="text" 
                    placeholder="Your organization name" 
                    className="pl-10"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isLoading ? "Submitting..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link to="/" className="text-primary font-medium hover:underline">
                Sign In
              </Link>
            </div>
            <div className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="hover:underline">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link to="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </div>
          </CardFooter>
        </Card>

        <AlertDialog open={showOrgDialog} onOpenChange={setShowOrgDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Organization Already Exists</AlertDialogTitle>
              <AlertDialogDescription>
                We found an existing organization called "{existingOrg?.name}". 
                If you're connected to this organization, we can ask the organization's admin to add you. 
                Should we send the request now?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, Create New Organization</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendJoinRequest}>
                Yes, Send Request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default SignUp;
