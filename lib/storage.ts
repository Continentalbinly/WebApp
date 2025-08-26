import { Config, Service, Customer, Invoice, InvoiceTemplate, User } from '@/types';

// Local storage keys
const STORAGE_KEYS = {
  CONFIG: 'lab_service_config',
  CUSTOMERS: 'lab_service_customers',
  SERVICES: 'lab_service_services',
  INVOICES: 'lab_service_invoices',
  TEMPLATES: 'lab_service_templates',
  USERS: 'lab_service_users',
  CURRENT_USER: 'lab_service_current_user',
} as const;

// Default configuration
const DEFAULT_CONFIG: Config = {
  main_folder_id: '',
  template_invoice_id: '',
  default_due_days: 15,
  admin_email: '',
  invoice_prefix: 'INV-',
};

// Default invoice template
const DEFAULT_TEMPLATE: InvoiceTemplate = {
  id: 'default',
  name: 'Default Invoice Template',
  content: [
    '<div class="invoice-template">',
    '  <div class="header">',
    '    <h1>INVOICE</h1>',
    '    <div class="invoice-info">',
    '      <p><strong>Invoice #:</strong> {{invoiceNumber}}</p>',
    '      <p><strong>Date:</strong> {{issueDate}}</p>',
    '      <p><strong>Due Date:</strong> {{dueDate}}</p>',
    '    </div>',
    '  </div>',
    '  <div class="customer-info">',
    '    <h3>Bill To:</h3>',
    '    <p>{{customerName}}</p>',
    '    <p>{{customerEmail}}</p>',
    '    <p>{{customerPhone}}</p>',
    '    <p>{{customerAddress}}</p>',
    '  </div>',
    '  <div class="services">',
    '    <table>',
    '      <thead>',
    '        <tr>',
    '          <th>Service</th>',
    '          <th>Description</th>',
    '          <th>Qty</th>',
    '          <th>Price</th>',
    '          <th>Total</th>',
    '        </tr>',
    '      </thead>',
    '      <tbody>',
    '        {{#each services}}',
    '        <tr>',
    '          <td>{{service.name}}</td>',
    '          <td>{{service.description}}</td>',
    '          <td>{{quantity}}</td>',
    '          <td>${{unitPrice}}</td>',
    '          <td>${{total}}</td>',
    '        </tr>',
    '        {{/each}}',
    '      </tbody>',
    '    </table>',
    '  </div>',
    '  <div class="totals">',
    '    <p><strong>Subtotal:</strong> ${{subtotal}}</p>',
    '    <p><strong>Tax:</strong> ${{tax}}</p>',
    '    <p><strong>Total:</strong> ${{total}}</p>',
    '  </div>',
    '  <div class="notes">',
    '    <p><strong>Notes:</strong> {{notes}}</p>',
    '  </div>',
    '</div>'
  ].join('\n'),
  isDefault: true,
};

// Default admin user
const DEFAULT_ADMIN_USER: User = {
  id: 'admin_001',
  email: 'admin@labservice.com',
  name: 'System Administrator',
  role: 'admin',
  createdAt: new Date(),
};

// Helper functions
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return defaultValue;
  }
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

// Configuration management
export const getConfig = (): Config => {
  return getStorageItem(STORAGE_KEYS.CONFIG, DEFAULT_CONFIG);
};

export const updateConfig = (config: Partial<Config>): Config => {
  const currentConfig = getConfig();
  const updatedConfig = { ...currentConfig, ...config };
  setStorageItem(STORAGE_KEYS.CONFIG, updatedConfig);
  return updatedConfig;
};

// Services management
export const getServices = (): Service[] => {
  return getStorageItem(STORAGE_KEYS.SERVICES, []);
};

export const addService = (service: Omit<Service, 'id'>): Service => {
  const services = getServices();
  const newService: Service = {
    ...service,
    id: `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  const updatedServices = [...services, newService];
  setStorageItem(STORAGE_KEYS.SERVICES, updatedServices);
  return newService;
};

export const updateService = (id: string, updates: Partial<Service>): Service | null => {
  const services = getServices();
  const index = services.findIndex(s => s.id === id);
  if (index === -1) return null;
  
  const updatedService = { ...services[index], ...updates };
  services[index] = updatedService;
  setStorageItem(STORAGE_KEYS.SERVICES, services);
  return updatedService;
};

export const deleteService = (id: string): boolean => {
  const services = getServices();
  const filteredServices = services.filter(s => s.id !== id);
  setStorageItem(STORAGE_KEYS.SERVICES, filteredServices);
  return filteredServices.length !== services.length;
};

// Customers management
export const getCustomers = (): Customer[] => {
  return getStorageItem(STORAGE_KEYS.CUSTOMERS, []);
};

export const addCustomer = (customer: Omit<Customer, 'id'>): Customer => {
  const customers = getCustomers();
  const newCustomer: Customer = {
    ...customer,
    id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  const updatedCustomers = [...customers, newCustomer];
  setStorageItem(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
  return newCustomer;
};

export const updateCustomer = (id: string, updates: Partial<Customer>): Customer | null => {
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === id);
  if (index === -1) return null;
  
  const updatedCustomer = { ...customers[index], ...updates };
  customers[index] = updatedCustomer;
  setStorageItem(STORAGE_KEYS.CUSTOMERS, customers);
  return updatedCustomer;
};

export const deleteCustomer = (id: string): boolean => {
  const customers = getCustomers();
  const filteredCustomers = customers.filter(c => c.id !== id);
  setStorageItem(STORAGE_KEYS.CUSTOMERS, filteredCustomers);
  return filteredCustomers.length !== customers.length;
};

// Invoices management
export const getInvoices = (): Invoice[] => {
  return getStorageItem(STORAGE_KEYS.INVOICES, []);
};

export const addInvoice = (invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
  const invoices = getInvoices();
  const config = getConfig();
  const invoiceNumber = `${config.invoice_prefix}${Date.now()}`;
  
  const newInvoice: Invoice = {
    ...invoice,
    id: `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    invoiceNumber,
  };
  
  const updatedInvoices = [...invoices, newInvoice];
  setStorageItem(STORAGE_KEYS.INVOICES, updatedInvoices);
  return newInvoice;
};

export const updateInvoice = (id: string, updates: Partial<Invoice>): Invoice | null => {
  const invoices = getInvoices();
  const index = invoices.findIndex(i => i.id === id);
  if (index === -1) return null;
  
  const updatedInvoice = { ...invoices[index], ...updates };
  invoices[index] = updatedInvoice;
  setStorageItem(STORAGE_KEYS.INVOICES, invoices);
  return updatedInvoice;
};

export const deleteInvoice = (id: string): boolean => {
  const invoices = getInvoices();
  const filteredInvoices = invoices.filter(i => i.id !== id);
  setStorageItem(STORAGE_KEYS.INVOICES, filteredInvoices);
  return filteredInvoices.length !== invoices.length;
};

// Templates management
export const getTemplates = (): InvoiceTemplate[] => {
  return getStorageItem(STORAGE_KEYS.TEMPLATES, [DEFAULT_TEMPLATE]);
};

export const addTemplate = (template: Omit<InvoiceTemplate, 'id'>): InvoiceTemplate => {
  const templates = getTemplates();
  const newTemplate: InvoiceTemplate = {
    ...template,
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  const updatedTemplates = [...templates, newTemplate];
  setStorageItem(STORAGE_KEYS.TEMPLATES, updatedTemplates);
  return newTemplate;
};

export const updateTemplate = (id: string, updates: Partial<InvoiceTemplate>): InvoiceTemplate | null => {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  const updatedTemplate = { ...templates[index], ...updates };
  templates[index] = updatedTemplate;
  setStorageItem(STORAGE_KEYS.TEMPLATES, templates);
  return updatedTemplate;
};

export const deleteTemplate = (id: string): boolean => {
  const templates = getTemplates();
  const filteredTemplates = templates.filter(t => t.id !== id);
  setStorageItem(STORAGE_KEYS.TEMPLATES, filteredTemplates);
  return filteredTemplates.length !== templates.length;
};

// Authentication functions
export const getUsers = (): User[] => {
  const users = getStorageItem(STORAGE_KEYS.USERS, []);
  if (!users || users.length === 0) {
    // Initialize with default admin user
    const defaultUsers = [DEFAULT_ADMIN_USER];
    setStorageItem(STORAGE_KEYS.USERS, defaultUsers);
    return defaultUsers;
  }
  return users;
};

export const addUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const users = getUsers();
  const newUser: User = {
    ...user,
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };
  const updatedUsers = [...users, newUser];
  setStorageItem(STORAGE_KEYS.USERS, updatedUsers);
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User | null => {
  const users = getUsers();
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  const updatedUser = { ...users[userIndex], ...updates };
  users[userIndex] = updatedUser;
  setStorageItem(STORAGE_KEYS.USERS, users);
  return updatedUser;
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  if (filteredUsers.length === users.length) return false;
  
  setStorageItem(STORAGE_KEYS.USERS, filteredUsers);
  return true;
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(user => user.id === id) || null;
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
};

export const setCurrentUser = (user: User | null): void => {
  setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const getCurrentUser = (): User | null => {
  return getStorageItem(STORAGE_KEYS.CURRENT_USER, null);
};

export const logout = (): void => {
  setCurrentUser(null);
};
