import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Building, Clock, LogOut } from 'lucide-react';
import { useAuthData } from '@/hooks/useAuthData';
import { useAuth } from '@/contexts/AuthContext';

export const UserInfo: React.FC = () => {
  const { 
    userID, 
    organizationID, 
    userEmail, 
    loginTime, 
    expiresAt,
    getSessionAge,
    getTimeUntilExpiry,
    isSessionExpiringSoon
  } = useAuthData();
  
  const { logout } = useAuth();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const sessionAge = getSessionAge();
  const timeUntilExpiry = getTimeUntilExpiry();
  const isExpiringSoon = isSessionExpiringSoon(30); // 30 minutes

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Information
        </CardTitle>
        <CardDescription>
          Current session details and user data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Email:</span>
            <span className="text-sm">{userEmail || 'N/A'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">User ID:</span>
            <Badge variant="outline" className="text-xs font-mono">
              {userID ? userID.substring(0, 8) + '...' : 'N/A'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <Building className="h-3 w-3" />
              Organization ID:
            </span>
            <Badge variant="secondary">{organizationID || 'N/A'}</Badge>
          </div>
        </div>

        {/* Session Information */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Session Information
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Login Time:</span>
              <span>{loginTime ? formatDate(loginTime) : 'N/A'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Session Age:</span>
              <span>{formatDuration(sessionAge)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expires At:</span>
              <span>{expiresAt ? formatDate(expiresAt) : 'N/A'}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Time Remaining:</span>
              <Badge 
                variant={isExpiringSoon ? "destructive" : "default"}
                className={isExpiringSoon ? "animate-pulse" : ""}
              >
                {formatDuration(timeUntilExpiry)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t">
          <Button 
            onClick={logout} 
            variant="outline" 
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 