
import React from 'react';
import { Order } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';
import { FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose } from '@/components/ui/dialog';
import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

const OrderDetails = ({ order, onClose }: OrderDetailsProps) => {
  const [askQuestionOpen, setAskQuestionOpen] = useState(false);
  
  // Mock documents for demonstration
  const mockDocuments = [
    { id: 1, name: 'Municipal Lien Search Report', type: 'PDF', size: '1.2 MB', date: new Date() },
    { id: 2, name: 'Property Tax Certificate', type: 'PDF', size: '0.8 MB', date: new Date() },
    { id: 3, name: 'Utility Statement', type: 'PDF', size: '0.5 MB', date: new Date() },
  ];

  const handleDownload = (docName: string) => {
    console.log(`Downloading ${docName}`);
    // In a real app, this would trigger an actual download
  };
  
  const handleAskQuestion = () => {
    setAskQuestionOpen(true);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-3xl p-6" onClick={(e) => e.stopPropagation()}>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order #{order.id} Details</CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAskQuestion();
                }}
                className="flex items-center gap-1"
              >
                <HelpCircle className="h-4 w-4" />
                Ask a Question
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
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
                {order.status === 'delivered' ? (
                  mockDocuments.map((doc) => (
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
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDownload(doc.name)}
                      >
                        Download
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 border rounded-md bg-gray-50">
                    <p className="text-muted-foreground">
                      Documents will be available when the order is completed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Sheet open={askQuestionOpen} onOpenChange={setAskQuestionOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Ask a Question about Order #{order.id}</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <p className="text-muted-foreground">
              Use this form to ask questions about your order. Our support team will respond as soon as possible.
            </p>
            <textarea 
              className="w-full min-h-[150px] p-3 border rounded-md" 
              placeholder="Type your question here..."
            ></textarea>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAskQuestionOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                console.log("Question submitted");
                setAskQuestionOpen(false);
              }}>Submit Question</Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OrderDetails;
