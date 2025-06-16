
import React from 'react';

interface OrderData {
  id: string;
  customer: string;
  address: string;
  county: string;
  status: string;
  amount: number;
  orderDate: string;
  paidStatus: string;
}

interface AdminOrderTableProps {
  data: OrderData[];
}

const AdminOrderTable = ({ data }: AdminOrderTableProps) => {
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderTable;
