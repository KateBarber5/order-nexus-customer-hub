import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AdminReportFilters from '@/components/AdminReportFilters';
import AdminOrderTable from '@/components/AdminOrderTable';
import AdminOrderAccordion from '@/components/AdminOrderAccordion';

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

const Admin = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Mock data with dates for demonstration
  const mockOrderData = [
    { customer: 'John Doe', email: 'john@example.com', orderCount: 15, totalAmount: 2500, lastOrderDate: '2024-01-15' },
    { customer: 'Jane Smith', email: 'jane@example.com', orderCount: 8, totalAmount: 1200, lastOrderDate: '2024-02-20' },
    { customer: 'Bob Johnson', email: 'bob@example.com', orderCount: 12, totalAmount: 1800, lastOrderDate: '2024-03-10' },
    { customer: 'Alice Williams', email: 'alice@example.com', orderCount: 6, totalAmount: 900, lastOrderDate: '2024-03-25' },
    { customer: 'Mike Davis', email: 'mike@example.com', orderCount: 20, totalAmount: 3200, lastOrderDate: '2024-04-05' },
    { customer: 'Sarah Wilson', email: 'sarah@example.com', orderCount: 9, totalAmount: 1400, lastOrderDate: '2024-04-15' },
  ];

  // Mock customer order data for specific customer reports - using state to allow updates
  const [mockCustomerOrderData, setMockCustomerOrderData] = useState<OrderData[]>([
    { id: 'ORD-001', customer: 'John Doe', address: '123 Main St, Anytown, CA', county: 'Los Angeles', status: 'delivered', amount: 150, orderDate: '2024-01-15', paidStatus: 'Paid' },
    { id: 'ORD-002', customer: 'John Doe', address: '456 Oak Ave, Anytown, CA', county: 'Los Angeles', status: 'completed', amount: 200, orderDate: '2024-02-10', paidStatus: 'Paid' },
    { id: 'ORD-003', customer: 'Jane Smith', address: '789 Pine St, Somewhere, CA', county: 'San Diego', status: 'shipped', amount: 175, orderDate: '2024-02-20', paidStatus: 'Unpaid' },
    { id: 'ORD-004', customer: 'Bob Johnson', address: '321 Elm Dr, Nowhere, CA', county: 'Orange', status: 'processing', amount: 125, orderDate: '2024-03-10', paidStatus: 'Unpaid' },
    { id: 'ORD-005', customer: 'John Doe', address: '654 Maple Ln, Anytown, CA', county: 'Los Angeles', status: 'delivered', amount: 300, orderDate: '2024-03-15', paidStatus: 'Paid' },
    { id: 'ORD-006', customer: 'Alice Williams', address: '987 Cedar St, Elsewhere, CA', county: 'Riverside', status: 'pending', amount: 225, orderDate: '2024-03-25', paidStatus: 'Unpaid' },
  ]);

  // Get unique customers for dropdown
  const uniqueCustomers = [...new Set(mockCustomerOrderData.map(order => order.customer))];

  // Get customer orders grouped by customer
  const customerOrdersGrouped = useMemo(() => {
    const grouped = mockCustomerOrderData.reduce((acc, order) => {
      if (!acc[order.customer]) {
        acc[order.customer] = [];
      }
      acc[order.customer].push(order);
      return acc;
    }, {} as Record<string, typeof mockCustomerOrderData>);

    // Calculate summary data for each customer
    return Object.entries(grouped).map(([customerName, orders]) => {
      const customerInfo = mockOrderData.find(data => data.customer === customerName);
      return {
        customer: customerName,
        email: customerInfo?.email || 'N/A',
        orderCount: orders.length,
        totalAmount: orders.reduce((sum, order) => sum + order.amount, 0),
        orders: orders
      };
    });
  }, [mockCustomerOrderData]);

  // Filter data based on report type, date range, and customer(s)
  const filteredData = useMemo(() => {
    if (reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf') {
      let customerOrders = mockCustomerOrderData;
      
      // Filter by customer if selected
      if (selectedCustomer) {
        customerOrders = customerOrders.filter(order => order.customer === selectedCustomer);
      }
      
      // Filter by multiple customers if selected
      if (selectedCustomers.length > 0) {
        customerOrders = customerOrders.filter(order => selectedCustomers.includes(order.customer));
      }
      
      // Filter by date range
      if (startDate || endDate) {
        customerOrders = customerOrders.filter(order => {
          const orderDate = new Date(order.orderDate);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && end) {
            return orderDate >= start && orderDate <= end;
          } else if (start) {
            return orderDate >= start;
          } else if (end) {
            return orderDate <= end;
          }
          return true;
        });
      }
      
      return customerOrders;
    } else {
      let filteredOrderData = mockOrderData;
      
      // Filter by multiple customers if selected
      if (selectedCustomers.length > 0) {
        filteredOrderData = filteredOrderData.filter(item => selectedCustomers.includes(item.customer));
      }
      
      // Filter by date range
      if (startDate || endDate) {
        filteredOrderData = filteredOrderData.filter(item => {
          const itemDate = new Date(item.lastOrderDate);
          const start = startDate ? new Date(startDate) : null;
          const end = endDate ? new Date(endDate) : null;

          if (start && end) {
            return itemDate >= start && itemDate <= end;
          } else if (start) {
            return itemDate >= start;
          } else if (end) {
            return itemDate <= end;
          }
          return true;
        });
      }
      
      return filteredOrderData;
    }
  }, [startDate, endDate, selectedCustomer, selectedCustomers, reportType, mockCustomerOrderData]);

  // Filter customerOrdersGrouped based on selected customers
  const filteredCustomerOrdersGrouped = useMemo(() => {
    if (selectedCustomers.length > 0) {
      return customerOrdersGrouped.filter(customerData => 
        selectedCustomers.includes(customerData.customer)
      );
    }
    return customerOrdersGrouped;
  }, [customerOrdersGrouped, selectedCustomers]);

  const handleMarkOrdersAsPaid = (customerName: string) => {
    setMockCustomerOrderData(prevData => 
      prevData.map(order => 
        order.customer === customerName && order.paidStatus === 'Unpaid'
          ? { ...order, paidStatus: 'Paid' }
          : order
      )
    );
    
    toast({
      title: "Orders Marked as Paid",
      description: `All unpaid orders for ${customerName} have been marked as paid.`,
    });
  };

  const generateCSV = () => {
    let headers, csvContent;
    
    if (reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf') {
      headers = ['Order ID', 'Customer Name', 'Address', 'County', 'Status', 'Amount', 'Order Date', 'Paid Status'];
      csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
          `"${row.id}","${row.customer}","${row.address}","${row.county}","${row.status}",${row.amount},"${row.orderDate}","${row.paidStatus}"`
        )
      ].join('\n');
    } else {
      headers = ['Customer Name', 'Email', 'Order Count', 'Total Amount'];
      csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
          `"${row.customer}","${row.email}",${row.orderCount},${row.totalAmount}`
        )
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType.includes('customer-order') ? 'customer_order' : 'order'}_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let tableContent, reportTitle;
      
      if (reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf') {
        reportTitle = selectedCustomer ? `Customer Order Report - ${selectedCustomer}` : 'Customer Order Report';
        tableContent = `
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Address</th>
              <th>County</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Order Date</th>
              <th>Paid Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(row => `
              <tr>
                <td>${row.id}</td>
                <td>${row.customer}</td>
                <td>${row.address}</td>
                <td>${row.county}</td>
                <td>${row.status}</td>
                <td>$${row.amount}</td>
                <td>${row.orderDate}</td>
                <td>${row.paidStatus}</td>
              </tr>
            `).join('')}
          </tbody>
        `;
      } else {
        reportTitle = 'Order Summary Report';
        tableContent = `
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Order Count</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(row => `
              <tr>
                <td>${row.customer}</td>
                <td>${row.email}</td>
                <td>${row.orderCount}</td>
                <td>$${row.totalAmount}</td>
              </tr>
            `).join('')}
          </tbody>
        `;
      }
      
      const htmlContent = `
        <html>
          <head>
            <title>${reportTitle} - ${startDate} to ${endDate}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>${reportTitle}</h1>
            <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
            ${selectedCustomer ? `<p><strong>Customer:</strong> ${selectedCustomer}</p>` : ''}
            ${selectedCustomers.length > 0 ? `<p><strong>Filtered Customers:</strong> ${selectedCustomers.join(', ')}</p>` : ''}
            <p><strong>Records Found:</strong> ${filteredData.length}</p>
            <table>${tableContent}</table>
          </body>
        </html>
      `;
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate || !reportType) {
      toast({
        title: "Missing Information",
        description: "Please select both start and end dates, and choose a report type.",
        variant: "destructive",
      });
      return;
    }

    if ((reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf') && !selectedCustomer) {
      toast({
        title: "Missing Customer Selection",
        description: "Please select a customer for the Customer Order Report.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (reportType === 'csv' || reportType === 'pdf' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf') {
        const isCSV = reportType.includes('csv');
        if (isCSV) {
          generateCSV();
          toast({
            title: "CSV Report Generated",
            description: `Your CSV report has been downloaded successfully. Found ${filteredData.length} records.`,
          });
        } else {
          generatePDF();
          toast({
            title: "PDF Report Generated",
            description: `Your PDF report is ready for printing/saving. Found ${filteredData.length} records.`,
          });
        }
      }
      setIsGenerating(false);
    }, 1000);
  };

  const isCustomerOrderReport = reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="page-title">Admin</h1>
        
        <AdminReportFilters
          startDate={startDate}
          endDate={endDate}
          reportType={reportType}
          selectedCustomer={selectedCustomer}
          selectedCustomers={selectedCustomers}
          isGenerating={isGenerating}
          uniqueCustomers={uniqueCustomers}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onReportTypeChange={setReportType}
          onCustomerChange={setSelectedCustomer}
          onMultipleCustomersChange={setSelectedCustomers}
          onGenerateReport={handleGenerateReport}
        />

        <Card>
          <CardHeader>
            <CardTitle>Order Reporting</CardTitle>
            <CardDescription>
              {startDate || endDate || selectedCustomer || selectedCustomers.length > 0
                ? `Filtered results for the selected criteria (${filteredData.length} records found)`
                : `Sample data that would be included in the report (${filteredData.length} total records)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCustomerOrderReport ? (
              <AdminOrderTable data={filteredData as OrderData[]} />
            ) : (
              <AdminOrderAccordion 
                customerOrdersGrouped={filteredCustomerOrdersGrouped}
                onMarkOrdersAsPaid={handleMarkOrdersAsPaid}
              />
            )}
            {filteredData.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No records found for the selected criteria.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
