'use client';

import React, { useEffect, useState } from 'react';
import { getInvoices, getCustomers, getServices } from '@/lib/storage';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  FileText, 
  Users, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalInvoices: number;
  totalCustomers: number;
  totalServices: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalInvoices: 0,
    totalCustomers: 0,
    totalServices: 0,
    totalRevenue: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        const invoices = getInvoices();
        const customers = getCustomers();
        const services = getServices();

        const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total, 0);

        setStats({
          totalInvoices: invoices.length,
          totalCustomers: customers.length,
          totalServices: services.length,
          totalRevenue,
        });

        setRecentInvoices(invoices.slice(-5).reverse());
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">Welcome to your Lab Service System</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        <Link href="/invoices/create" className="bg-white rounded-lg shadow p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Invoice</h3>
              <p className="text-sm text-gray-600">Generate a new invoice for your customer</p>
            </div>
          </div>
        </Link>

        <Link href="/customers" className="bg-white rounded-lg shadow p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Customers</h3>
              <p className="text-sm text-gray-600">Add or edit customer information</p>
            </div>
          </div>
        </Link>

        <Link href="/services" className="bg-white rounded-lg shadow p-4 lg:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Manage Services</h3>
              <p className="text-sm text-gray-600">Update your service catalog and pricing</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Recent Invoices</h2>
            <Link href="/invoices" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          </div>
        </div>
        
        {recentInvoices.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="px-4 lg:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base lg:text-lg font-medium text-gray-900 truncate">
                        {invoice.invoiceNumber}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{invoice.customer?.name || 'Unknown Customer'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(new Date(invoice.issueDate))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 sm:flex-shrink-0">
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(invoice.total)}
                      </p>
                    </div>
                    <Link href={`/invoices/${invoice.id}`}>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 lg:px-6 py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4">Get started by creating your first invoice.</p>
            <Link href="/invoices/create">
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
