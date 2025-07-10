
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import InteractiveFloridaMap from '@/components/InteractiveFloridaMap';

const FloridaMap = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="page-title">Florida Service Areas</h1>
          <div className="text-sm text-gray-600">
            Click on counties to view available services
          </div>
        </div>
        <InteractiveFloridaMap />
      </div>
    </DashboardLayout>
  );
};

export default FloridaMap;
