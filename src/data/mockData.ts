
export interface Order {
  id: string;
  address: string;
  parcelId: string;
  county: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'canceled' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export const mockOrders: Order[] = [
  {
    id: '1',
    address: '123 Main St, Anytown, CA',
    parcelId: 'P12345',
    county: 'Los Angeles',
    status: 'delivered',
    createdAt: '2023-01-15T09:30:00Z',
    updatedAt: '2023-01-18T14:20:00Z'
  },
  {
    id: '2',
    address: '456 Elm St, Somewhere, CA',
    parcelId: 'P67890',
    county: 'San Diego',
    status: 'shipped',
    createdAt: '2023-02-20T11:45:00Z',
    updatedAt: '2023-02-21T16:30:00Z'
  },
  {
    id: '3',
    address: '789 Oak Dr, Nowhere, CA',
    parcelId: 'P24680',
    county: 'Orange',
    status: 'processing',
    createdAt: '2023-03-05T13:15:00Z',
    updatedAt: '2023-03-06T09:10:00Z'
  },
  {
    id: '4',
    address: '321 Pine Ave, Elsewhere, CA',
    parcelId: 'P13579',
    county: 'Riverside',
    status: 'pending',
    createdAt: '2023-03-10T15:20:00Z',
    updatedAt: '2023-03-10T15:20:00Z'
  },
  {
    id: '5',
    address: '654 Maple St, Testville, CA',
    parcelId: 'P99999',
    county: 'Ventura',
    status: 'failed',
    createdAt: '2023-03-12T10:30:00Z',
    updatedAt: '2023-03-12T10:30:00Z'
  }
];

export const mockCustomer: Customer = {
  id: '101',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  address: '123 Main Street',
  city: 'Anytown',
  state: 'CA',
  zipCode: '12345'
};
