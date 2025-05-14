
import React from 'react';
import Navigation from '@/components/Navigation';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout = ({ children, className }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className={cn("flex-1", className)}>
        <div className="dashboard-container">
          {children}
        </div>
      </main>
      <footer className="py-4 text-center text-sm text-gray-500 border-t">
        <p>&copy; {new Date().getFullYear()} GovMetric Municipal Lien Search. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default DashboardLayout;
