export interface Config {
  main_folder_id: string;
  template_invoice_id: string;
  default_due_days: number;
  admin_email: string;
  invoice_prefix: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  services: InvoiceService[];
  subtotal: number;
  tax: number;
  total: number;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes?: string;
}

export interface InvoiceService {
  serviceId: string;
  service: Service;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
