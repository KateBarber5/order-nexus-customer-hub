
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

  // Filter data based on date range
  const filteredData = useMemo(() => {
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
  }, [startDate, endDate]);

  const generateCSV = () => {
    const headers = ['Customer Name', 'Email', 'Order Count', 'Total Amount', 'Last Order Date'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        `"${row.customer}","${row.email}",${row.orderCount},${row.totalAmount},"${row.lastOrderDate}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `order_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    // For PDF generation, we'll create a simple HTML structure and use window.print
    // In a real application, you might want to use a library like jsPDF or react-to-pdf
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const htmlContent = `
        <html>
          <head>
            <title>Order Report - ${startDate} to ${endDate}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { color: #333; }
            </style>
          </head>
          <body>
            <h1>Order Report</h1>
            <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
            <p><strong>Records Found:</strong> ${filteredData.length}</p>
            <table>
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Order Count</th>
                  <th>Total Amount</th>
                  <th>Last Order Date</th>
                </tr>
              </thead>
              <tbody>
                ${filteredData.map(row => `
                  <tr>
                    <td>${row.customer}</td>
                    <td>${row.email}</td>
                    <td>${row.orderCount}</td>
                    <td>$${row.totalAmount}</td>
                    <td>${row.lastOrderDate}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
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

    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (reportType === 'csv') {
        generateCSV();
        toast({
          title: "CSV Report Generated",
          description: `Your CSV report has been downloaded successfully. Found ${filteredData.length} records.`,
        });
      } else if (reportType === 'pdf') {
        generatePDF();
        toast({
          title: "PDF Report Generated",
          description: `Your PDF report is ready for printing/saving. Found ${filteredData.length} records.`,
        });
      }
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="page-title">Admin Dashboard</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate Reports
            </CardTitle>
            <CardDescription>
              Generate CSV and PDF reports for order counts by customer for a specific time period.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV Report</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                </SelectContent>
              </Select>
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
              {startDate || endDate 
                ? `Filtered results for the selected date range (${filteredData.length} records found)`
                : `Sample data that would be included in the report (${filteredData.length} total records)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-4 py-2 text-left">Customer Name</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Order Count</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Total Amount</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Last Order Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">{row.customer}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.email}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.orderCount}</td>
                      <td className="border border-gray-300 px-4 py-2">${row.totalAmount}</td>
                      <td className="border border-gray-300 px-4 py-2">{row.lastOrderDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No records found for the selected date range.
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
