
import React from 'react';
import { Order } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

const OrderDetails = ({ order, onClose }: OrderDetailsProps) => {
  // Mock documents for demonstration
  const mockDocuments = [
    { id: 1, name: 'Municipal Lien Search Report', type: 'PDF', size: '1.2 MB', date: new Date() },
    { id: 2, name: 'Property Tax Certificate', type: 'PDF', size: '0.8 MB', date: new Date() },
    { id: 3, name: 'Utility Statement', type: 'PDF', size: '0.5 MB', date: new Date() },
  ];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order #{order.id} Details</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Property Address</h3>
                <p className="text-lg">{order.address}</p>
              </div>
              
              {order.parcelId && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Parcel ID</h3>
                  <p className="text-lg font-mono">{order.parcelId}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">County</h3>
                <p className="text-lg">{order.county}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Created Date</h3>
                <p className="text-lg">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                <StatusBadge status={order.status} className="text-sm" />
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Documents</h3>
              <div className="space-y-2">
                {mockDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-primary mr-3" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • {doc.size} • {format(doc.date, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Download</Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetails;
