
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { Order } from '@/data/mockData';
import { FileSearch, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: Order;
}

const OrderCard = ({ order }: OrderCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-primary/10 p-2 rounded-full mr-3">
              <FileSearch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium">
                Search #{order.id}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </div>
            </div>
          </div>
          
          <StatusBadge status={order.status} />
        </div>
        
        <div className="space-y-3">
          <div>
            <div className="text-xs text-muted-foreground">Property Address</div>
            <div className="text-sm">{order.address}</div>
          </div>
          
          <div className="flex justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Parcel ID</div>
              <div className="text-sm font-mono">{order.parcelId}</div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground">County</div>
              <div className="text-sm">{order.county}</div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 p-3">
        <div className="w-full flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Results
          </Button>
          
          {order.status === 'delivered' && (
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
