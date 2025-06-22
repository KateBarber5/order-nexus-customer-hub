
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { FileText, Download } from 'lucide-react';

interface AdminReportFiltersProps {
  startDate: string;
  endDate: string;
  reportType: string;
  selectedCustomer: string;
  selectedCustomers: string[];
  isGenerating: boolean;
  uniqueCustomers: string[];
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReportTypeChange: (type: string) => void;
  onCustomerChange: (customer: string) => void;
  onMultipleCustomersChange: (customers: string[]) => void;
  onGenerateReport: () => void;
}

const AdminReportFilters = ({
  startDate,
  endDate,
  reportType,
  selectedCustomer,
  selectedCustomers,
  isGenerating,
  uniqueCustomers,
  onStartDateChange,
  onEndDateChange,
  onReportTypeChange,
  onCustomerChange,
  onMultipleCustomersChange,
  onGenerateReport,
}: AdminReportFiltersProps) => {
  const isCustomerOrderReport = reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf';

  const customerOptions: Option[] = uniqueCustomers.map(customer => ({
    label: customer,
    value: customer
  }));

  return (
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
            onReportTypeChange(value);
            onCustomerChange(''); // Reset customer selection when changing report type
            onMultipleCustomersChange([]); // Reset multiple customer selection
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
            <Select value={selectedCustomer} onValueChange={onCustomerChange}>
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

        <div className="space-y-2">
          <Label htmlFor="customer-filter">Filter by Customers</Label>
          <MultiSelect
            options={customerOptions}
            selected={selectedCustomers}
            onChange={onMultipleCustomersChange}
            placeholder="Select customers to filter..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
        </div>
        
        <Button 
          onClick={onGenerateReport} 
          disabled={isGenerating}
          className="w-full md:w-auto"
        >
          <Download className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminReportFilters;
