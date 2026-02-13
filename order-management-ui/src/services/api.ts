import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  unit: string;
  shelfLifeDays: number;
  storageTemperature: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentTerms: string;
  active: boolean;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  businessName: string;
  creditLimit: number;
  active: boolean;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  supplierId: number;
  supplierName: string;
  status: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: string;
  deliveryDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantityOnHand: number;
  reorderLevel: number;
  reorderQuantity: number;
  warehouseLocation: string;
  lastRestockedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const productApi = {
  getAll: (page = 0, size = 20, sortBy = 'name') =>
    api.get<PageResponse<Product>>(`/products?page=${page}&size=${size}&sortBy=${sortBy}`),
  getById: (id: number) => api.get<Product>(`/products/${id}`),
  getByCategory: (category: string) => api.get<Product[]>(`/products/category/${category}`),
  search: (name: string) => api.get<Product[]>(`/products/search?name=${name}`),
  create: (data: Partial<Product>) => api.post<Product>('/products', data),
  update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const supplierApi = {
  getAll: (page = 0, size = 20, sortBy = 'name') =>
    api.get<PageResponse<Supplier>>(`/suppliers?page=${page}&size=${size}&sortBy=${sortBy}`),
  getById: (id: number) => api.get<Supplier>(`/suppliers/${id}`),
  getActive: () => api.get<Supplier[]>('/suppliers/active'),
  search: (name: string) => api.get<Supplier[]>(`/suppliers/search?name=${name}`),
  create: (data: Partial<Supplier>) => api.post<Supplier>('/suppliers', data),
  update: (id: number, data: Partial<Supplier>) => api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

export const customerApi = {
  getAll: (page = 0, size = 20, sortBy = 'name') =>
    api.get<PageResponse<Customer>>(`/customers?page=${page}&size=${size}&sortBy=${sortBy}`),
  getById: (id: number) => api.get<Customer>(`/customers/${id}`),
  getActive: () => api.get<Customer[]>('/customers/active'),
  search: (name: string) => api.get<Customer[]>(`/customers/search?name=${name}`),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
  update: (id: number, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const orderApi = {
  getAll: (page = 0, size = 20, sortBy = 'createdAt') =>
    api.get<PageResponse<Order>>(`/orders?page=${page}&size=${size}&sortBy=${sortBy}`),
  getById: (id: number) => api.get<Order>(`/orders/${id}`),
  getByStatus: (status: string) => api.get<Order[]>(`/orders/status/${status}`),
  getByCustomer: (customerId: number) => api.get<Order[]>(`/orders/customer/${customerId}`),
  create: (data: { customerId: number; supplierId?: number; items: { productId: number; quantity: number; unitPrice: number }[]; shippingAddress?: string; deliveryDate?: string; notes?: string }) =>
    api.post<Order>('/orders', data),
  update: (id: number, data: { customerId: number; supplierId?: number; items: { productId: number; quantity: number; unitPrice: number }[]; shippingAddress?: string; deliveryDate?: string; notes?: string }) =>
    api.put<Order>(`/orders/${id}`, data),
  updateStatus: (id: number, status: string) =>
    api.patch<Order>(`/orders/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

export const inventoryApi = {
  getAll: (page = 0, size = 20, sortBy = 'id') =>
    api.get<PageResponse<Inventory>>(`/inventory?page=${page}&size=${size}&sortBy=${sortBy}`),
  getById: (id: number) => api.get<Inventory>(`/inventory/${id}`),
  getByProduct: (productId: number) => api.get<Inventory>(`/inventory/product/${productId}`),
  getLowStock: () => api.get<Inventory[]>('/inventory/low-stock'),
  getByWarehouse: (location: string) => api.get<Inventory[]>(`/inventory/warehouse/${location}`),
  create: (data: Partial<Inventory> & { productId: number }) => api.post<Inventory>('/inventory', data),
  update: (id: number, data: Partial<Inventory> & { productId?: number }) => api.put<Inventory>(`/inventory/${id}`, data),
  restock: (id: number, quantity: number) =>
    api.patch<Inventory>(`/inventory/${id}/restock`, { quantity }),
  delete: (id: number) => api.delete(`/inventory/${id}`),
};

export default api;
