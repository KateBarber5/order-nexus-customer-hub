import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { sessionManager, UserSession, LoginResponse } from '@/services/orderService';
import { govMetricLogin } from '@/services/orderService';

interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  userSession: UserSession | null;
  isLoading: boolean;
  
  // Authentication functions
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshSession: () => boolean;
  
  // User data getters
  getCurrentUserID: () => string | null;
  getCurrentOrganizationID: () => number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const session = sessionManager.getSession();
        if (session && session.isAuthenticated && session.expiresAt > Date.now()) {
          setUserSession(session);
          setIsAuthenticated(true);
          console.log('Authentication initialized from session:', session);
        } else {
          // Clear any invalid session data
          sessionManager.clearSession();
          setUserSession(null);
          setIsAuthenticated(false);
          console.log('No valid session found, user not authenticated');
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        sessionManager.clearSession();
        setUserSession(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set up session refresh interval
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh session every 30 minutes
      const refreshInterval = setInterval(() => {
        const refreshed = sessionManager.refreshSession();
        if (refreshed) {
          const updatedSession = sessionManager.getSession();
          if (updatedSession) {
            setUserSession(updatedSession);
          }
        } else {
          // Session refresh failed, logout user
          logout();
        }
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated]);

  const login = async (email: string, password: string, rememberMe: boolean): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      console.log('Attempting login with email:', email);
      
      const response: LoginResponse = await govMetricLogin(email, password);
      console.log('Login API response:', response);

      // Validate login response
      if (response.LoginIsValid === true && response.UserID && response.OrganizationID) {
        // Create session data
        const loginTime = Date.now();
        const expiresAt = rememberMe 
          ? loginTime + (7 * 24 * 60 * 60 * 1000) // 7 days for remember me
          : loginTime + (24 * 60 * 60 * 1000);    // 24 hours for session storage

        const session: UserSession = {
          isAuthenticated: true,
          userID: response.UserID,
          organizationID: response.OrganizationID,
          organizationName: response.OrganizationName,
          roleId: response.RoleId,
          roleName: response.RoleName,
          userTimeZone: response.UserTimeZone,
          email: email,
          loginTime: loginTime,
          expiresAt: expiresAt
        };

        // Store session
        sessionManager.storeSession(session, rememberMe);
        
        // Update state
        setUserSession(session);
        setIsAuthenticated(true);
        
        console.log('Login successful, session created:', session);
        return { 
          success: true, 
          message: 'Login successful! Redirecting to dashboard...' 
        };
      } else {
        // Handle login failure
        const errorMessage = response.Error && response.Error.length > 0 
          ? response.Error[0].Message 
          : "Login failed. Please check your credentials.";
        
        console.log('Login failed:', errorMessage);
        return { 
          success: false, 
          message: errorMessage 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login. Please try again.';
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out user');
    sessionManager.clearSession();
    setUserSession(null);
    setIsAuthenticated(false);
    
    // Redirect to login page
    window.location.href = '/';
  };

  const refreshSession = (): boolean => {
    const refreshed = sessionManager.refreshSession();
    if (refreshed) {
      const updatedSession = sessionManager.getSession();
      if (updatedSession) {
        setUserSession(updatedSession);
        return true;
      }
    }
    return false;
  };

  const getCurrentUserID = (): string | null => {
    return sessionManager.getCurrentUserID();
  };

  const getCurrentOrganizationID = (): number | null => {
    return sessionManager.getCurrentOrganizationID();
  };

  const value: AuthContextType = {
    isAuthenticated,
    userSession,
    isLoading,
    login,
    logout,
    refreshSession,
    getCurrentUserID,
    getCurrentOrganizationID
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 