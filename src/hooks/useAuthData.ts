import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom hook to easily access authentication data and user information
 * Provides convenient getters for user ID, organization ID, and other session data
 */
export const useAuthData = () => {
  const { 
    isAuthenticated, 
    userSession, 
    isLoading, 
    getCurrentUserID, 
    getCurrentOrganizationID 
  } = useAuth();

  return {
    // Authentication status
    isAuthenticated,
    isLoading,
    
    // User session data
    userSession,
    userID: getCurrentUserID(),
    organizationID: getCurrentOrganizationID(),
    userEmail: userSession?.email,
    
    // Session timing
    loginTime: userSession?.loginTime,
    expiresAt: userSession?.expiresAt,
    
    // Helper functions
    hasValidSession: () => {
      return isAuthenticated && userSession && userSession.expiresAt > Date.now();
    },
    
    getSessionAge: () => {
      if (!userSession?.loginTime) return 0;
      return Date.now() - userSession.loginTime;
    },
    
    getTimeUntilExpiry: () => {
      if (!userSession?.expiresAt) return 0;
      return userSession.expiresAt - Date.now();
    },
    
    isSessionExpiringSoon: (minutes: number = 30) => {
      const timeUntilExpiry = userSession?.expiresAt ? userSession.expiresAt - Date.now() : 0;
      return timeUntilExpiry > 0 && timeUntilExpiry < (minutes * 60 * 1000);
    }
  };
}; 