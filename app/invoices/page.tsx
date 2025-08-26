'use client';

import React, { useEffect, useState } from 'react';
import { getInvoices, deleteInvoice } from '@/lib/storage';
import { Invoice } from '@/types';
import Button from '@/components/ui/Button';
import { FileText, Eye, Trash2, Search, Download, Plus, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadInvoices();
    }
  }, []);

  const loadInvoices = () => {
    try {
      const allInvoices = getInvoices();
      setInvoices(allInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        deleteInvoice(id);
        loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'sent':
        return '📤';
      case 'overdue':
        return '⚠️';
      case 'draft':
        return '📝';
      default:
        return '•';
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-sm lg:text-base text-gray-600">View and manage your invoices</p>
            </div>
          </div>
          <Link href="/invoices/create">
            <Button className="flex items-center space-x-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span>Create Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices by number or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">
              All Invoices ({filteredInvoices.length})
            </h3>
            {filteredInvoices.length > 0 && (
              <div className="text-sm text-gray-500">
                Total: {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + inv.total, 0))}
              </div>
            )}
          </div>
        </div>
        {filteredInvoices.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <div key={invoice.id} className="px-4 lg:px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base lg:text-lg font-medium text-gray-900 truncate">
                        {invoice.invoiceNumber}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Customer:</span>
                        <span className="truncate">{invoice.customer?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Issue Date:</span>
                        <span>{formatDate(new Date(invoice.issueDate))}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Due Date:</span>
                        <span>{formatDate(new Date(invoice.dueDate))}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 lg:flex-shrink-0">
                    <Link href={`/invoices/${invoice.id}`}>
                      <Button size="sm" variant="outline" className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span className="hidden sm:inline">View</span>
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement PDF download
                        alert('PDF download feature coming soon!');
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(invoice.id)}
                      loading={deletingId === invoice.id}
                      className="flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 lg:px-6 py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-sm lg:text-base text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by creating your first invoice.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Link href="/invoices/create">
                <Button className="flex items-center space-x-2 mx-auto">
                  <Plus className="h-4 w-4" />
                  <span>Create First Invoice</span>
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
