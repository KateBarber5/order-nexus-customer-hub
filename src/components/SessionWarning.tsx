import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthData } from '@/hooks/useAuthData';

interface SessionWarningProps {
  warningMinutes?: number;
  className?: string;
}

export const SessionWarning: React.FC<SessionWarningProps> = ({ 
  warningMinutes = 30,
  className = ''
}) => {
  const { refreshSession } = useAuth();
  const { isSessionExpiringSoon, getTimeUntilExpiry } = useAuthData();
  const [showWarning, setShowWarning] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const checkSessionExpiry = () => {
      const expiringSoon = isSessionExpiringSoon(warningMinutes);
      setShowWarning(expiringSoon);
    };

    // Check immediately
    checkSessionExpiry();

    // Check every minute
    const interval = setInterval(checkSessionExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [isSessionExpiringSoon, warningMinutes]);

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      const success = refreshSession();
      if (success) {
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Failed to refresh session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeRemaining = () => {
    const timeRemaining = getTimeUntilExpiry();
    if (timeRemaining <= 0) return 'Expired';
    
    const minutes = Math.floor(timeRemaining / (60 * 1000));
    const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (!showWarning) {
    return null;
  }

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <Clock className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800">Session Expiring Soon</AlertTitle>
      <AlertDescription className="text-orange-700">
        Your session will expire in {formatTimeRemaining()}. 
        To continue working, please refresh your session.
      </AlertDescription>
      <div className="mt-3">
        <Button
          onClick={handleRefreshSession}
          disabled={isRefreshing}
          size="sm"
          variant="outline"
          className="border-orange-300 text-orange-700 hover:bg-orange-100"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Session
            </>
          )}
        </Button>
      </div>
    </Alert>
  );
}; 