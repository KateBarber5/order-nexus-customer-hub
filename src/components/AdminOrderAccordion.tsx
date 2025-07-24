
import React from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
                      onMarkOrdersAsPaid(customerData.customer);
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
                              onClick={() => onMarkOrderAsPaid(order.id)}
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
