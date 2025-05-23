import React, { useState, useEffect } from 'react';
import { mockOrders } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Calendar as CalendarIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import OrderDetails from './OrderDetails';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const OrderHistory = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusFromUrl = queryParams.get('status');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusFromUrl || 'all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  
  // Update status filter when URL changes
  useEffect(() => {
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [statusFromUrl]);
  
  const filteredOrders = mockOrders.filter(order => {
    // Text search filter
    const matchesSearch = 
      order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.parcelId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.county.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (startDate) {
      const orderDate = new Date(order.createdAt);
      const filterStartDate = new Date(startDate);
      filterStartDate.setHours(0, 0, 0, 0);
      matchesDateRange = orderDate >= filterStartDate;
    }
    if (endDate && matchesDateRange) {
      const orderDate = new Date(order.createdAt);
      const filterEndDate = new Date(endDate);
      filterEndDate.setHours(23, 59, 59, 999); // Set to end of day
      matchesDateRange = orderDate <= filterEndDate;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const clearDateFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-1">
          <Label htmlFor="search" className="mb-2 block text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="search"
              placeholder="Address, parcel ID, county"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="status-filter" className="mb-2 block text-sm font-medium">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">In Research</SelectItem>
              <SelectItem value="delivered">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="date-filter-start" className="mb-2 block text-sm font-medium">Order Created Date Start</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-filter-start"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label htmlFor="date-filter-end" className="mb-2 block text-sm font-medium">Order Created Date End</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-filter-end"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {(startDate || endDate) && (
          <div className="md:col-span-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={clearDateFilters}>
              Clear Dates
            </Button>
          </div>
        )}
      </div>
      
      {/* Table section - keep existing code for table display */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-muted-foreground">No searches found matching your criteria.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Property Address</TableHead>
                <TableHead>Parcel ID</TableHead>
                <TableHead>County</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>{order.address}</TableCell>
                  <TableCell className="font-mono">{order.parcelId}</TableCell>
                  <TableCell>{order.county}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </Button>
                      {order.status === 'delivered' && (
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedOrder && (
        <OrderDetails order={selectedOrder} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default OrderHistory;
