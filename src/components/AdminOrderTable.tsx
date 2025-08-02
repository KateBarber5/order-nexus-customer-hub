
import React from 'react';
import { Button } from '@/components/ui/button';
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

interface AdminOrderTableProps {
  data: OrderData[];
  onMarkOrderAsPaid: (orderId: string) => void;
}

const AdminOrderTable = ({ data, onMarkOrderAsPaid }: AdminOrderTableProps) => {
  const { toast } = useToast();

  const handleMarkAsPaid = async (orderId: string) => {
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Customer Name</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
            <th className="border border-gray-300 px-4 py-2 text-left">County</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Order Date</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Paid Status</th>
            <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border border-gray-300 px-4 py-2">{row.id}</td>
              <td className="border border-gray-300 px-4 py-2">{row.customer}</td>
              <td className="border border-gray-300 px-4 py-2">{row.address}</td>
              <td className="border border-gray-300 px-4 py-2">{row.county}</td>
              <td className="border border-gray-300 px-4 py-2">{row.status}</td>
              <td className="border border-gray-300 px-4 py-2">${row.amount}</td>
              <td className="border border-gray-300 px-4 py-2">{row.orderDate}</td>
              <td className="border border-gray-300 px-4 py-2">{row.paidStatus}</td>
              <td className="border border-gray-300 px-4 py-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={row.paidStatus === 'Paid'}
                  onClick={() => handleMarkAsPaid(row.id)}
                >
                  Mark as Paid
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderTable;
