
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Subscriptions from "./pages/Subscriptions";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import FloridaMap from "./pages/FloridaMap";
import ExampleReport from "./pages/ExampleReport";
import CountiesCitiesConfig from "./pages/CountiesCitiesConfig";
import Organizations from "./pages/Organizations";
import OrganizationDetails from "./pages/OrganizationDetails";

// Debug logging
console.log('App.tsx: Starting application initialization');

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
    console.log('ErrorBoundary: Constructor called');
  }

  static getDerivedStateFromError(error: Error) {
    console.log('ErrorBoundary: getDerivedStateFromError called with:', error);
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console
    console.error('ErrorBoundary: Error caught by boundary:', error);
    console.error('ErrorBoundary: Error info:', errorInfo);
    
    // Check if it's a message port error and handle it gracefully
    if (error.message.includes('message port') || error.message.includes('asynchronous response')) {
      console.log('ErrorBoundary: Message port error detected, attempting to recover...');
      // Don't set hasError for message port errors, let the app continue
      this.setState({ hasError: false });
      return;
    }
  }

  render() {
    console.log('ErrorBoundary: Rendering, hasError:', this.state.hasError);
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We encountered an unexpected error. Please refresh the page to try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on message port errors
        if (error instanceof Error && 
            (error.message.includes('message port') || error.message.includes('asynchronous response'))) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  console.log('App: Component rendering');
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <ProtectedRoute requireAuth={false}>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/admin/counties-cities" element={
                  <ProtectedRoute requireAdmin={true}>
                    <CountiesCitiesConfig />
                  </ProtectedRoute>
                } />
                <Route path="/admin/organizations" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Organizations />
                  </ProtectedRoute>
                } />
                <Route path="/admin/organizations/:id" element={
                  <ProtectedRoute requireAdmin={true}>
                    <OrganizationDetails />
                  </ProtectedRoute>
                } />
                <Route path="/subscriptions" element={
                  <ProtectedRoute requireOrgAdmin={true}>
                    <Subscriptions />
                  </ProtectedRoute>
                } />
                <Route path="/billing" element={
                  <ProtectedRoute>
                    <Billing />
                  </ProtectedRoute>
                } />
                <Route path="/florida-map" element={
                  <ProtectedRoute>
                    <FloridaMap />
                  </ProtectedRoute>
                } />
                <Route path="/example-report" element={
                  <ProtectedRoute>
                    <ExampleReport />
                  </ProtectedRoute>
                } />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
