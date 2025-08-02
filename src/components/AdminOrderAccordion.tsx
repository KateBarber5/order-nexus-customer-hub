
import React from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { setGovOrderPaidStatus } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';

interface OrderData {
  id: string;
  customer: string;
  address: string;
  county: string;
  status: string;
  amount: string;
  orderDate: string;
  paidStatus: string;
}

interface CustomerOrderData {
  customer: string;
  email: string;
  orderCount: number;
  totalAmount: number;
  orders: OrderData[];
}

interface AdminOrderAccordionProps {
  customerOrdersGrouped: CustomerOrderData[];
  onMarkOrdersAsPaid: (customerName: string) => void;
  onMarkOrderAsPaid: (orderId: string) => void;
}

const AdminOrderAccordion = ({ customerOrdersGrouped, onMarkOrdersAsPaid, onMarkOrderAsPaid }: AdminOrderAccordionProps) => {
  const { toast } = useToast();

  const handleMarkOrderAsPaid = async (orderId: string) => {
    try {
      // Convert orderId to number for the API call
      const orderIdNumber = parseInt(orderId, 10);
      
      if (isNaN(orderIdNumber)) {
        toast({
          title: "Error",
          description: "Invalid order ID format",
          variant: "destructive",
        });
        return;
      }

      // Call the API to set the order as paid
      const response = await setGovOrderPaidStatus(orderIdNumber, "Paid");
      
      // Check if the API call was successful
      if (response.oMessages && response.oMessages.length > 0) {
        const successMessage = response.oMessages.find(msg => msg.Type === 2);
        const errorMessage = response.oMessages.find(msg => msg.Type !== 2);
        
        if (successMessage) {
          toast({
            title: "Success",
            description: successMessage.Description,
          });
          // Call the parent callback to update the UI
          onMarkOrderAsPaid(orderId);
        } else if (errorMessage) {
          toast({
            title: "Error",
            description: errorMessage.Description,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error marking order as paid:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark order as paid",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllOrdersAsPaid = async (customerName: string) => {
    try {
      // Find all unpaid orders for this customer
      const customerData = customerOrdersGrouped.find(customer => customer.customer === customerName);
      if (!customerData) {
        toast({
          title: "Error",
          description: "Customer not found",
          variant: "destructive",
        });
        return;
      }

      const unpaidOrders = customerData.orders.filter(order => order.paidStatus === 'Unpaid');
      
      if (unpaidOrders.length === 0) {
        toast({
          title: "Info",
          description: "No unpaid orders found for this customer",
        });
        return;
      }

      // Mark all unpaid orders as paid
      let successCount = 0;
      let errorCount = 0;

      for (const order of unpaidOrders) {
        try {
          const orderIdNumber = parseInt(order.id, 10);
          if (!isNaN(orderIdNumber)) {
            const response = await setGovOrderPaidStatus(orderIdNumber, "Paid");
            
            if (response.oMessages && response.oMessages.length > 0) {
              const successMessage = response.oMessages.find(msg => msg.Type === 2);
              if (successMessage) {
                successCount++;
                onMarkOrderAsPaid(order.id);
              } else {
                errorCount++;
              }
            }
          }
        } catch (error) {
          console.error(`Error marking order ${order.id} as paid:`, error);
          errorCount++;
        }
      }

      // Show summary toast
      if (successCount > 0 && errorCount === 0) {
        toast({
          title: "Success",
          description: `Successfully marked ${successCount} orders as paid`,
        });
      } else if (successCount > 0 && errorCount > 0) {
        toast({
          title: "Partial Success",
          description: `Marked ${successCount} orders as paid, ${errorCount} failed`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to mark any orders as paid`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error marking all orders as paid:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to mark orders as paid",
        variant: "destructive",
      });
    }
  };

  return (
    <Accordion type="multiple" className="w-full">
      {customerOrdersGrouped.map((customerData, index) => {
        const hasUnpaidOrders = customerData.orders.some(order => order.paidStatus === 'Unpaid');
        
        return (
          <AccordionItem key={customerData.customer} value={`customer-${index}`}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full mr-4">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{customerData.customer}</span>
                  <span className="text-sm text-gray-600">{customerData.email}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm">Orders: {customerData.orderCount}</span>
                  <span className="text-sm">Total: ${customerData.totalAmount}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!hasUnpaidOrders}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAllOrdersAsPaid(customerData.customer);
                    }}
                    className="text-sm"
                  >
                    Mark All Orders as Paid
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <h4 className="font-medium mb-3">Customer Orders</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-3 py-2 text-left text-sm">Order ID</th>
                        <th className="border border-gray-200 px-3 py-2 text-left text-sm">Address</th>
                        <th className="border border-gray-200 px-3 py-2 text-left text-sm">County</th>
                        <th className="border border-gray-200 px-3 py-2 text-left text-sm">Status</th>
                        <th className="border border-gray-200 px-3 py-2 text-left text-sm">Amount</th>
                        <th className="border border-gray-200 px-3 py-2 text-left text-sm">Order Date</th>
                        <th className="border border-gray-200 px-3 py-2 text-left text-sm">Paid Status</th>
                        <th className="border border-gray-200 px-3 py-2 text-left text-sm">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerData.orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="border border-gray-200 px-3 py-2 text-sm">{order.id}</td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">{order.address}</td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">{order.county}</td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">{order.status}</td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">${order.amount}</td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">{order.orderDate}</td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">{order.paidStatus}</td>
                          <td className="border border-gray-200 px-3 py-2 text-sm">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={order.paidStatus === 'Paid'}
                              onClick={() => handleMarkOrderAsPaid(order.id)}
                            >
                              Mark as Paid
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default AdminOrderAccordion;
