import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect, Option } from '@/components/ui/multi-select';
import { FileText, Download } from 'lucide-react';
import { getOrganizations, Organization } from '@/services/orderService';

interface AdminReportFiltersProps {
  startDate: string;
  endDate: string;
  reportType: string;
  selectedCustomer: string;
  selectedCustomers: string[];
  selectedPaidStatus: string;
  isGenerating: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReportTypeChange: (type: string) => void;
  onCustomerChange: (customer: string) => void;
  onMultipleCustomersChange: (customers: string[]) => void;
  onPaidStatusChange: (status: string) => void;
  onGenerateReport: () => void;
}

const AdminReportFilters = ({
  startDate,
  endDate,
  reportType,
  selectedCustomer,
  selectedCustomers,
  selectedPaidStatus,
  isGenerating,
  onStartDateChange,
  onEndDateChange,
  onReportTypeChange,
  onCustomerChange,
  onMultipleCustomersChange,
  onPaidStatusChange,
  onGenerateReport,
}: AdminReportFiltersProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [organizationsError, setOrganizationsError] = useState<string | null>(null);

  // Fetch organizations on component mount
  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        setLoadingOrganizations(true);
        setOrganizationsError(null);
        const orgs = await getOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error('Error loading organizations:', error);
        setOrganizationsError('Failed to load organizations');
        // Set empty array to prevent further errors
        setOrganizations([]);
      } finally {
        setLoadingOrganizations(false);
      }
    };

    loadOrganizations();
  }, []);

  const isCustomerOrderReport = reportType === 'customer-order' || reportType === 'customer-order-csv' || reportType === 'customer-order-pdf';

  // Create customer options from organizations
  const customerOptions: Option[] = organizations.map(org => ({
    label: org.OrganizationName,
    value: org.OrganizationName
  }));

  // Get unique customer names for the single customer select
  const uniqueCustomers = organizations.map(org => org.OrganizationName);

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
            {loadingOrganizations ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading customers...</span>
              </div>
            ) : organizationsError ? (
              <div className="text-center py-4 text-destructive">
                <p className="text-sm">{organizationsError}</p>
                <Button 
                  onClick={() => {
                    setLoadingOrganizations(true);
                    setOrganizationsError(null);
                    getOrganizations()
                      .then(orgs => setOrganizations(orgs))
                      .catch(error => {
                        console.error('Error loading organizations:', error);
                        setOrganizationsError('Failed to load organizations');
                        setOrganizations([]);
                      })
                      .finally(() => setLoadingOrganizations(false));
                  }}
                  className="mt-2"
                  variant="outline"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            ) : (
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
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="customer-filter">Filter by Customers</Label>
          {loadingOrganizations ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading customers...</span>
            </div>
          ) : organizationsError ? (
            <div className="text-center py-4 text-destructive">
              <p className="text-sm">{organizationsError}</p>
              <Button 
                onClick={() => {
                  setLoadingOrganizations(true);
                  setOrganizationsError(null);
                  getOrganizations()
                    .then(orgs => setOrganizations(orgs))
                    .catch(error => {
                      console.error('Error loading organizations:', error);
                      setOrganizationsError('Failed to load organizations');
                      setOrganizations([]);
                    })
                    .finally(() => setLoadingOrganizations(false));
                }}
                className="mt-2"
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
            </div>
          ) : (
            <MultiSelect
              options={customerOptions}
              selected={selectedCustomers}
              onChange={onMultipleCustomersChange}
              placeholder="Select customers to filter..."
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="paid-status">Filter by Paid Status</Label>
          <Select value={selectedPaidStatus} onValueChange={onPaidStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select paid status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Unpaid">Unpaid</SelectItem>
            </SelectContent>
          </Select>
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
