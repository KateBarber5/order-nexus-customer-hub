
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'failed' | 'failed-pa-site-down' | 'failed-code-site-down' | 'failed-permit-site-down' | 'failed-bad-address';
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'failed-pa-site-down':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed-code-site-down':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed-permit-site-down':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'failed-bad-address':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'In Research';
      case 'delivered':
        return 'Completed';
      case 'canceled':
        return 'Canceled';
      case 'failed':
        return 'Failed';
      case 'failed-pa-site-down':
        return 'Failed - PA Site Down';
      case 'failed-code-site-down':
        return 'Failed - Code Site Down';
      case 'failed-permit-site-down':
        return 'Failed - Permit Site Down';
      case 'failed-bad-address':
        return 'Failed - Bad Address';
      default:
        return status;
    }
  };

  return (
    <Badge className={cn(getStatusStyles(), 'font-medium', className)}>
      {getStatusLabel()}
    </Badge>
  );
};

export default StatusBadge;
