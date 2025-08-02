import React, { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AdminReportFilters from '@/components/AdminReportFilters';
import AdminOrderTable from '@/components/AdminOrderTable';
import AdminOrderAccordion from '@/components/AdminOrderAccordion';
import AdminSubscriptionsGrid from '@/components/AdminSubscriptionsGrid';
import { getAdminOrderReporting, AdminOrderReportingResponse, AdminOrder, AdminOrderReportingFilter } from '@/services/orderService';

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

const Admin = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedPaidStatus, setSelectedPaidStatus] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [adminOrderData, setAdminOrderData] = useState<AdminOrderReportingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch admin order reporting data
  const fetchAdminOrderData = async (filters: AdminOrderReportingFilter[] = []) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminOrderReporting(filters);
      setAdminOrderData(data);
    } catch (err) {
      console.error('Error fetching admin order data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order data');
      toast({
        title: "Error",
        description: "Failed to fetch order data from API",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAdminOrderData();
  }, []);

  // Transform API data to match the expected format
  const transformApiDataToOrderData = (apiData: AdminOrderReportingResponse[]): OrderData[] => {
    const orderData: OrderData[] = [];
    
    apiData.forEach(org => {
      // Check if Orders array exists and is not empty
      if (org.Orders && Array.isArray(org.Orders)) {
        org.Orders.forEach(order => {
          orderData.push({
            id: order.GovOrderID,
            customer: org.OrganizationName,
            address: order.GovOrderAddress,
            county: order.GovOrderCounty,
            status: order.GovOrderStatus,
            amount: order.GovOrderAmount,
            orderDate: order.GovOrderCreateDate,
            paidStatus: order.GovOrderPaidStatus
          });
        });
      }
    });
    
    return orderData;
  };

  // Transform API data to summary format for accordion view
  const transformApiDataToSummaryData = (apiData: AdminOrderReportingResponse[]) => {
    return apiData.map(org => {
      // Check if Orders array exists and is not empty
      const orders = org.Orders && Array.isArray(org.Orders) ? org.Orders : [];
      const lastOrderDate = orders.length > 0 ? orders[0].GovOrderCreateDate : 'N/A';
      
      return {
        customer: org.OrganizationName,
        email: '', // API doesn't provide email
        orderCount: org.OrdersNumber,
        totalAmount: parseFloat(org.OrdersAmount) || 0,
        lastOrderDate: lastOrderDate,
        orders: orders.map(order => ({
          id: order.GovOrderID,
          customer: org.OrganizationName,
          address: order.GovOrderAddress,
          county: order.GovOrderCounty,
          status: order.GovOrderStatus,
          amount: order.GovOrderAmount,
          orderDate: order.GovOrderCreateDate,
          paidStatus: order.GovOrderPaidStatus
        }))
      };
    });
  };

  // Get unique customers for dropdown
  const uniqueCustomers = useMemo(() => {
    if (!Array.isArray(adminOrderData)) return [];
    return [...new Set(adminOrderData.map(org => org.OrganizationName))];
  }, [adminOrderData]);

  // Get customer orders grouped by customer
  const customerOrdersGrouped = useMemo(() => {
    if (!Array.isArray(adminOrderData)) return [];
    return transformApiDataToSummaryData(adminOrderData);
  }, [adminOrderData]);

  // Filter data based on report type, date range, customer(s), and paid status
  const filteredData = useMemo(() => {
    if (!Array.isArray(adminOrderData)) return [];
    
    if (reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf') {
      let customerOrders = transformApiDataToOrderData(adminOrderData);
      
      // Filter by customer if selected
      if (selectedCustomer) {
        customerOrders = customerOrders.filter(order => order.customer === selectedCustomer);
      }
      
      // Filter by multiple customers if selected
      if (selectedCustomers.length > 0) {
        customerOrders = customerOrders.filter(order => selectedCustomers.includes(order.customer));
      }

      // Filter by paid status if selected (change empty string check to "all" check)
      if (selectedPaidStatus && selectedPaidStatus !== 'all') {
        customerOrders = customerOrders.filter(order => order.paidStatus === selectedPaidStatus);
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
      let filteredOrderData = transformApiDataToSummaryData(adminOrderData);
      
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
  }, [startDate, endDate, selectedCustomer, selectedCustomers, selectedPaidStatus, reportType, adminOrderData]);

  // Filter customerOrdersGrouped based on selected customers and paid status
  const filteredCustomerOrdersGrouped = useMemo(() => {
    let filtered = customerOrdersGrouped;
    
    if (selectedCustomers.length > 0) {
      filtered = filtered.filter(customerData => 
        selectedCustomers.includes(customerData.customer)
      );
    }

    if (selectedPaidStatus && selectedPaidStatus !== 'all') {
      filtered = filtered.map(customerData => ({
        ...customerData,
        orders: customerData.orders.filter(order => order.paidStatus === selectedPaidStatus),
        orderCount: customerData.orders.filter(order => order.paidStatus === selectedPaidStatus).length,
        totalAmount: customerData.orders
          .filter(order => order.paidStatus === selectedPaidStatus)
          .reduce((sum, order) => sum + parseFloat(order.amount) || 0, 0)
      })).filter(customerData => customerData.orders.length > 0);
    }

    return filtered;
  }, [customerOrdersGrouped, selectedCustomers, selectedPaidStatus]);

  const handleMarkOrdersAsPaid = (customerName: string) => {
    // Note: This would typically call an API to update the paid status
    // For now, we'll just show a toast message
    toast({
      title: "Orders Marked as Paid",
      description: `All unpaid orders for ${customerName} have been marked as paid. This would typically update the database via API.`,
    });
  };

  const handleMarkOrderAsPaid = (orderId: string) => {
    // Note: This would typically call an API to update the paid status
    // For now, we'll just show a toast message
    toast({
      title: "Order Marked as Paid",
      description: `Order ${orderId} has been marked as paid.`,
    });
  };

  const generateCSV = () => {
    let headers, csvContent;
    
    if (reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf') {
      headers = ['Order ID', 'Customer Name', 'Address', 'County', 'Status', 'Amount', 'Order Date', 'Paid Status'];
      csvContent = [
        headers.join(','),
        ...filteredData.map(row => 
          `"${row.id}","${row.customer}","${row.address}","${row.county}","${row.status}","${row.amount}","${row.orderDate}","${row.paidStatus}"`
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
            ${selectedPaidStatus ? `<p><strong>Filtered Paid Status:</strong> ${selectedPaidStatus}</p>` : ''}
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
    
    try {
      // Build filters for the API call
      const filters: AdminOrderReportingFilter[] = [];
      
      if (selectedCustomer) {
        filters.push({
          FilterID: "OrganizationName",
          FilterValue: selectedCustomer
        });
      }
      
      if (selectedCustomers.length > 0) {
        selectedCustomers.forEach(customer => {
          filters.push({
            FilterID: "OrganizationName",
            FilterValue: customer
          });
        });
      }
      
      if (selectedPaidStatus && selectedPaidStatus !== 'all') {
        filters.push({
          FilterID: "PaidStatus",
          FilterValue: selectedPaidStatus
        });
      }
      
      if (startDate) {
        filters.push({
          FilterID: "StartDate",
          FilterValue: startDate
        });
      }
      
      if (endDate) {
        filters.push({
          FilterID: "EndDate",
          FilterValue: endDate
        });
      }
      
      // Fetch fresh data with filters
      await fetchAdminOrderData(filters);
      
      // Generate report
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
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isCustomerOrderReport = reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf';

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <h1 className="page-title">Admin</h1>
        
        <Tabs defaultValue="order-reporting" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="order-reporting">Order Reporting</TabsTrigger>
            <TabsTrigger value="client-subscriptions">Account Subscriptions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="order-reporting" className="space-y-6">
            <AdminReportFilters
              startDate={startDate}
              endDate={endDate}
              reportType={reportType}
              selectedCustomer={selectedCustomer}
              selectedCustomers={selectedCustomers}
              selectedPaidStatus={selectedPaidStatus}
              isGenerating={isGenerating}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onReportTypeChange={setReportType}
              onCustomerChange={setSelectedCustomer}
              onMultipleCustomersChange={setSelectedCustomers}
              onPaidStatusChange={setSelectedPaidStatus}
              onGenerateReport={handleGenerateReport}
            />

            <Card>
              <CardHeader>
                <CardTitle>Order Reporting</CardTitle>
                <CardDescription>
                  {startDate || endDate || selectedCustomer || selectedCustomers.length > 0 || selectedPaidStatus
                    ? `Filtered results for the selected criteria (${filteredData.length} records found)`
                    : `Sample data that would be included in the report (${filteredData.length} total records)`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">Loading order data...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-destructive">
                    <p className="text-sm">{error}</p>
                    <Button 
                      onClick={() => fetchAdminOrderData()} 
                      className="mt-2"
                      variant="outline"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    {isCustomerOrderReport ? (
                      <AdminOrderTable 
                        data={filteredData as OrderData[]} 
                        onMarkOrderAsPaid={handleMarkOrderAsPaid}
                      />
                    ) : (
                      <AdminOrderAccordion 
                        customerOrdersGrouped={filteredCustomerOrdersGrouped}
                        onMarkOrdersAsPaid={handleMarkOrdersAsPaid}
                        onMarkOrderAsPaid={handleMarkOrderAsPaid}
                      />
                    )}
                    {filteredData.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No records found for the selected criteria.
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="client-subscriptions">
            <AdminSubscriptionsGrid />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
