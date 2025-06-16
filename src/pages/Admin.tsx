import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
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

  // Mock customer order data for specific customer reports
  const mockCustomerOrderData = [
    { id: 'ORD-001', customer: 'John Doe', address: '123 Main St, Anytown, CA', parcelId: 'P12345', county: 'Los Angeles', status: 'delivered', amount: 150, orderDate: '2024-01-15' },
    { id: 'ORD-002', customer: 'John Doe', address: '456 Oak Ave, Anytown, CA', parcelId: 'P12346', county: 'Los Angeles', status: 'completed', amount: 200, orderDate: '2024-02-10' },
    { id: 'ORD-003', customer: 'Jane Smith', address: '789 Pine St, Somewhere, CA', parcelId: 'P12347', county: 'San Diego', status: 'shipped', amount: 175, orderDate: '2024-02-20' },
    { id: 'ORD-004', customer: 'Bob Johnson', address: '321 Elm Dr, Nowhere, CA', parcelId: 'P12348', county: 'Orange', status: 'processing', amount: 125, orderDate: '2024-03-10' },
    { id: 'ORD-005', customer: 'John Doe', address: '654 Maple Ln, Anytown, CA', parcelId: 'P12349', county: 'Los Angeles', status: 'delivered', amount: 300, orderDate: '2024-03-15' },
    { id: 'ORD-006', customer: 'Alice Williams', address: '987 Cedar St, Elsewhere, CA', parcelId: 'P12350', county: 'Riverside', status: 'pending', amount: 225, orderDate: '2024-03-25' },
  ];

  // Get unique customers for dropdown
  const uniqueCustomers = [...new Set(mockCustomerOrderData.map(order => order.customer))];

  // Filter data based on report type, date range, and customer
  const filteredData = useMemo(() => {
    if (reportType === 'customer-order') {
      let customerOrders = mockCustomerOrderData;
      
      // Filter by customer if selected
      if (selectedCustomer) {
        customerOrders = customerOrders.filter(order => order.customer === selectedCustomer);
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
      // Original order summary data
      if (!startDate && !endDate) {
        return mockOrderData;
      }

      return mockOrderData.filter(item => {
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
  }, [startDate, endDate, selectedCustomer, reportType]);

  const handleMarkOrdersAsPaid = (customerName: string) => {
    toast({
      title: "Orders Marked as Paid",
      description: `All orders for ${customerName} have been marked as paid.`,
    });
  };

  const generateCSV = () => {
    let headers, csvContent;
    
    if (reportType === 'customer-order') {
      headers = ['Order ID', 'Customer Name', 'Address', 'Parcel ID', 'County', 'Status', 'Amount', 'Order Date'];
      csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
          `"${row.id}","${row.customer}","${row.address}","${row.parcelId}","${row.county}","${row.status}",${row.amount},"${row.orderDate}"`
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
    link.setAttribute('download', `${reportType === 'customer-order' ? 'customer_order' : 'order'}_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      let tableContent, reportTitle;
      
      if (reportType === 'customer-order') {
        reportTitle = selectedCustomer ? `Customer Order Report - ${selectedCustomer}` : 'Customer Order Report';
        tableContent = `
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer Name</th>
              <th>Address</th>
              <th>Parcel ID</th>
              <th>County</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Order Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(row => `
              <tr>
                <td>${row.id}</td>
                <td>${row.customer}</td>
                <td>${row.address}</td>
                <td>${row.parcelId}</td>
                <td>${row.county}</td>
                <td>${row.status}</td>
                <td>$${row.amount}</td>
                <td>${row.orderDate}</td>
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

    if (reportType === 'customer-order' && !selectedCustomer) {
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
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Reports
            </CardTitle>
            <CardDescription>
              Generate CSV and PDF reports for order data with customizable filters and date ranges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={(value) => {
                setReportType(value);
                setSelectedCustomer(''); // Reset customer selection when changing report type
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">Order Summary - CSV</SelectItem>
                  <SelectItem value="pdf">Order Summary - PDF</SelectItem>
                  <SelectItem value="customer-order-csv">Customer Order Report - CSV</SelectItem>
                  <SelectItem value="customer-order-pdf">Customer Order Report - PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isCustomerOrderReport && (
              <div className="space-y-2">
                <Label htmlFor="customer-select">Select Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCustomers.map((customer) => (
                      <SelectItem key={customer} value={customer}>
                        {customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
              className="w-full md:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Reporting</CardTitle>
            <CardDescription>
              {startDate || endDate || selectedCustomer
                ? `Filtered results for the selected criteria (${filteredData.length} records found)`
                : `Sample data that would be included in the report (${filteredData.length} total records)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {isCustomerOrderReport ? (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Customer Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Parcel ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">County</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Amount</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Order Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{row.id}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.customer}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.address}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.parcelId}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.county}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.status}</td>
                        <td className="border border-gray-300 px-4 py-2">${row.amount}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.orderDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Customer Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Order Count</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Total Amount</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{row.customer}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.email}</td>
                        <td className="border border-gray-300 px-4 py-2">{row.orderCount}</td>
                        <td className="border border-gray-300 px-4 py-2">${row.totalAmount}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleMarkOrdersAsPaid(row.customer)}
                            className="text-sm"
                          >
                            Mark Orders as Paid
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No records found for the selected criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
