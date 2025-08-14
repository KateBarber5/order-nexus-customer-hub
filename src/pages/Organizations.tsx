import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import OrganizationsGrid from '@/components/OrganizationsGrid';

const Organizations = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage organizations, users, and account settings
          </p>
        </div>
        
        <OrganizationsGrid />
      </div>
    </DashboardLayout>
  );
};

export default Organizations;