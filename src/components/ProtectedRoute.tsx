import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requireAdmin?: boolean;
  requireOrgAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/',
  requireAdmin = false,
  requireOrgAdmin = false
}) => {
  const { isAuthenticated, isLoading, userSession } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required and user is not authenticated, redirect to login
  if (requireAuth && !isAuthenticated) {
    // Store the attempted URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to={redirectTo} replace />;
  }

  // If admin access is required, check if user has admin role
  if (requireAdmin && (!userSession || userSession.roleName !== 'Govmetric Admin')) {
    console.log('Access denied: User does not have admin privileges');
    return <Navigate to="/dashboard" replace />;
  }

  // If organization admin access is required, check if user has organization admin role
  if (requireOrgAdmin && (!userSession || userSession.roleName !== 'Organization Admin')) {
    console.log('Access denied: User does not have organization admin privileges');
    return <Navigate to="/dashboard" replace />;
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (!requireAuth && isAuthenticated && location.pathname === '/') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 