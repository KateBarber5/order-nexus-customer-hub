
import React from 'react';
import Navigation from '@/components/Navigation';
import { SessionWarning } from '@/components/SessionWarning';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout = ({ children, className }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      {/* Session Warning */}
      <div className="px-4 py-2">
        <SessionWarning warningMinutes={30} />
      </div>
      
      <main className={cn("flex-1", className)}>
        <div className="dashboard-container">
          {children}
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-gray-500 border-t bg-white">
        <p>&copy; 2025 GovMetric. All rights reserved.</p>
      </footer>
    </div>
  );
};

export { DashboardLayout };
export default DashboardLayout;
