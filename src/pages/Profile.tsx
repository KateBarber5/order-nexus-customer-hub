
import React from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import CustomerProfile from '@/components/CustomerProfile';

const Profile = () => {
  return (
    <DashboardLayout>
      <h1 className="page-title">Your Profile</h1>
      <div className="max-w-3xl mx-auto">
        <CustomerProfile />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
