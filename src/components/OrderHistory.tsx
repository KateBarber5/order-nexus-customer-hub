import React, { useState, useEffect } from 'react';
import { fetchOrdersFromAPI, Order } from '@/services/orderService';
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const OrderHistory = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusFromUrl = queryParams.get('status');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(statusFromUrl || 'all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleDownload = (docName: string, reportFilePath: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://order.govmetric.ai';
    const downloadUrl = `${apiBaseUrl}/aHTTPDownloadFile?iContentType=application%2Fpdf&iFileName=${encodeURIComponent(docName)}&iFilePath=${encodeURIComponent(reportFilePath)}`;
    
    // Create a temporary anchor element to trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = docName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Load API data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('OrderHistory: Starting to load API data...');
        
        const apiData = await fetchOrdersFromAPI();
        setOrders(apiData);
        console.log('OrderHistory: Successfully loaded API data:', apiData.length, 'orders');
        
      } catch (err) {
        console.error('OrderHistory: Error loading API data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders. Please try again later.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update status filter when URL changes
  useEffect(() => {
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
    }
  }, [statusFromUrl]);
  
  const filteredOrders = orders.filter(order => {
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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handle pagination changes
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

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
      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      )}

      {/* Filters and table - only show when not loading */}
      {!loading && (
        <>
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
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="failed-pa-site-down">Failed - PA Site Down</SelectItem>
              <SelectItem value="failed-code-site-down">Failed - Code Site Down</SelectItem>
              <SelectItem value="failed-permit-site-down">Failed - Permit Site Down</SelectItem>
              <SelectItem value="failed-bad-address">Failed - Bad Address</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">In Research</SelectItem>
              <SelectItem value="delivered">Completed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
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
      
      {/* Table section */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-muted-foreground">No searches found matching your criteria.</p>
        </div>
      ) : (
        <>
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
                {currentOrders.map((order) => (
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
                        {order.status === 'delivered' && order.reportFileName && order.reportFilePath && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleDownload(order.reportFileName, order.reportFilePath)}
                          >
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
          
          {/* Pagination controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select 
                value={itemsPerPage.toString()} 
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue>{itemsPerPage}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length}
              </span>
            </div>
            
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} 
                      className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first page, last page, and pages around current page
                    if (
                      page === 1 || 
                      page === totalPages || 
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            isActive={currentPage === page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    // Show ellipsis
                    else if (
                      page === 2 || 
                      page === totalPages - 1
                    ) {
                      return <PaginationItem key={page}>...</PaginationItem>;
                    }
                    return null;
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </>
      )}

          {selectedOrder && (
            <OrderDetails order={selectedOrder} onClose={handleCloseModal} />
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistory;
