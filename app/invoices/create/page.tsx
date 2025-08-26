'use client';

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getCustomers, getServices, getConfig, addInvoice } from '@/lib/storage';
import { Customer, Service, InvoiceService } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import { FileText, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { formatCurrency, generateInvoiceNumber, calculateDueDate } from '@/lib/utils';
import Link from 'next/link';

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  services: z.array(z.object({
    serviceId: z.string().min(1, 'Service is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price must be 0 or greater'),
  })).min(1, 'At least one service is required'),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export default function CreateInvoicePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      services: [{ serviceId: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'services',
  });

  const watchedServices = watch('services');
  const selectedCustomerId = watch('customerId');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const [allCustomers, allServices, systemConfig] = await Promise.all([
        getCustomers(),
        getServices(),
        getConfig(),
      ]);
      
      setCustomers(allCustomers);
      setServices(allServices);
      setConfig(systemConfig);
      
      // Set default dates
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const defaultDueDate = calculateDueDate(today, systemConfig?.default_due_days || 30);
      
      setValue('issueDate', todayString);
      setValue('dueDate', defaultDueDate.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return watchedServices.reduce((sum, service) => {
      return sum + (service.quantity * service.unitPrice);
    }, 0);
  };

  const calculateTax = (subtotal: number) => {
    // You can make tax rate configurable
    return subtotal * 0.1; // 10% tax
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    return subtotal + tax;
  };

  const handleServiceChange = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setValue(`services.${index}.unitPrice`, service.price);
    }
  };

  const addService = () => {
    append({ serviceId: '', quantity: 1, unitPrice: 0 });
  };

  const removeService = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const customer = customers.find(c => c.id === data.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const invoiceServices: InvoiceService[] = data.services.map(serviceData => {
        const service = services.find(s => s.id === serviceData.serviceId);
        if (!service) {
          throw new Error(`Service not found: ${serviceData.serviceId}`);
        }
        return {
          serviceId: serviceData.serviceId,
          service,
          quantity: serviceData.quantity,
          unitPrice: serviceData.unitPrice,
          total: serviceData.quantity * serviceData.unitPrice,
        };
      });

      const subtotal = calculateSubtotal();
      const tax = calculateTax(subtotal);
      const total = calculateTotal();

      const invoice = {
        customerId: data.customerId,
        customer,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        services: invoiceServices,
        subtotal,
        tax,
        total,
        status: 'draft' as const,
        notes: data.notes || '',
      };

      addInvoice(invoice);
      
      // Redirect to invoices list
      window.location.href = '/invoices';
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/invoices" className="p-2 text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Create Invoice</h1>
              <p className="text-sm lg:text-base text-gray-600">Generate a new invoice for your customer</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 lg:space-y-8">
        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Invoice Details</h2>
          
          {/* Customer Selection */}
          <div className="mb-6">
            <Select
              {...register('customerId')}
              label="Customer"
              options={customers.map(c => ({ value: c.id, label: c.name }))}
              error={errors.customerId?.message}
            />
          </div>

                     {/* Date Selection - Enhanced UX/UI */}
           <div className="space-y-6">
             <div className="flex items-center space-x-2 mb-4">
               <div className="w-1 h-6 bg-primary rounded-full"></div>
               <h3 className="text-lg font-semibold text-gray-800">Invoice Dates</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Issue Date */}
               <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                       <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                     </div>
                     <div>
                       <h4 className="text-sm font-semibold text-gray-800">Issue Date</h4>
                       <p className="text-xs text-gray-600">When invoice is created</p>
                     </div>
                   </div>
                   <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
                     Today
                   </div>
                 </div>
                 <DatePicker
                   value={watch('issueDate')}
                   onChange={(date) => setValue('issueDate', date)}
                   error={errors.issueDate?.message}
                   placeholder="Select issue date"
                 />
               </div>

               {/* Due Date */}
               <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                       <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                       </svg>
                     </div>
                     <div>
                       <h4 className="text-sm font-semibold text-gray-800">Due Date</h4>
                       <p className="text-xs text-gray-600">Payment deadline</p>
                     </div>
                   </div>
                   <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                     Auto-calculated
                   </div>
                 </div>
                 <DatePicker
                   value={watch('dueDate')}
                   onChange={(date) => setValue('dueDate', date)}
                   error={errors.dueDate?.message}
                   placeholder="Select due date"
                 />
               </div>
             </div>
           </div>
          
          {/* Date Helper Info - Mobile Friendly */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs">💡</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Date Selection Guide</h4>
                <div className="space-y-2 text-xs text-blue-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span><strong>Issue Date:</strong> When the invoice is created (defaults to today)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span><strong>Due Date:</strong> Payment deadline (auto-calculated from your settings)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span><strong>Tip:</strong> Tap the calendar icon to change dates easily</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Services</h2>
            <Button
              type="button"
              onClick={addService}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Service</span>
            </Button>
          </div>

                     <div className="space-y-6">
             {fields.map((field, index) => (
               <div key={field.id} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-2">
                     <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                       <span className="text-primary text-sm font-semibold">{index + 1}</span>
                     </div>
                     <h4 className="text-sm font-semibold text-gray-800">Service {index + 1}</h4>
                   </div>
                   {fields.length > 1 && (
                     <Button
                       type="button"
                       onClick={() => removeService(index)}
                       variant="outline"
                       size="sm"
                       className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                     >
                       <Trash2 className="h-4 w-4 mr-1" />
                       Remove
                     </Button>
                   )}
                 </div>
                 
                                   <div className="space-y-6">
                    {/* Service Selection */}
                    <div>
                      <Select
                        {...register(`services.${index}.serviceId`)}
                        label="Service"
                        options={services.map(s => ({ value: s.id, label: s.name }))}
                        error={errors.services?.[index]?.serviceId?.message}
                        onChange={(e) => handleServiceChange(index, e.target.value)}
                      />
                    </div>

                                         {/* Quantity and Price Section - Mobile Optimized */}
                     <div className="bg-white rounded-lg border border-gray-200 p-4 lg:p-6">
                       <div className="flex items-center justify-between mb-4 lg:mb-6">
                         <h5 className="text-sm lg:text-base font-semibold text-gray-700">Pricing Details</h5>
                         <div className="text-xs lg:text-sm text-gray-500 bg-gray-100 px-2 py-1 lg:px-3 lg:py-1.5 rounded-full">
                           Line Total
                         </div>
                       </div>
                       
                       {/* Mobile Layout - Stacked */}
                       <div className="block lg:hidden space-y-4">
                         {/* Quantity Input - Mobile */}
                         <div className="bg-gray-50 rounded-lg p-4">
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Quantity
                           </label>
                           <div className="relative">
                             <Input
                               {...register(`services.${index}.quantity`, { valueAsNumber: true })}
                               type="number"
                               min="1"
                               placeholder="1"
                               className="pr-16 text-center font-medium text-lg"
                               error={errors.services?.[index]?.quantity?.message}
                             />
                             <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                               units
                             </div>
                           </div>
                         </div>

                         {/* Unit Price Input - Mobile */}
                         <div className="bg-gray-50 rounded-lg p-4">
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                             Unit Price
                           </label>
                           <div className="relative">
                             <Input
                               {...register(`services.${index}.unitPrice`, { valueAsNumber: true })}
                               type="number"
                               step="0.01"
                               min="0"
                               placeholder="0.00"
                               className="pr-12 text-center font-medium text-lg"
                               error={errors.services?.[index]?.unitPrice?.message}
                             />
                             <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 font-medium">
                               $
                             </div>
                           </div>
                         </div>

                                                   {/* Line Total Display - Mobile */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Line Total
                              </label>
                              <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full font-medium">
                                Calculated
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-green-600 mb-2">
                              {formatCurrency(watchedServices[index]?.quantity * watchedServices[index]?.unitPrice || 0)}
                            </div>
                            <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded border">
                              {watchedServices[index]?.quantity || 0} × ${watchedServices[index]?.unitPrice || 0}
                            </div>
                          </div>
                       </div>

                                               {/* Desktop Layout - Grid */}
                        <div className="hidden lg:block space-y-4">
                          {/* First Row - Quantity and Unit Price */}
                          <div className="grid grid-cols-2 gap-4">
                            {/* Quantity Input - Desktop */}
                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity
                              </label>
                              <div className="relative">
                                <Input
                                  {...register(`services.${index}.quantity`, { valueAsNumber: true })}
                                  type="number"
                                  min="1"
                                  placeholder="1"
                                  className="pr-12 text-center font-medium"
                                  error={errors.services?.[index]?.quantity?.message}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                  units
                                </div>
                              </div>
                            </div>

                            {/* Unit Price Input - Desktop */}
                            <div className="relative">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Unit Price
                              </label>
                              <div className="relative">
                                <Input
                                  {...register(`services.${index}.unitPrice`, { valueAsNumber: true })}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  className="pr-8 text-center font-medium"
                                  error={errors.services?.[index]?.unitPrice?.message}
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                                  $
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Second Row - Line Total Display */}
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-semibold text-gray-700">
                                Line Total
                              </label>
                              <div className="text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full font-medium">
                                Calculated
                              </div>
                            </div>
                            <div className="text-xl font-bold text-green-600 mb-1">
                              {formatCurrency(watchedServices[index]?.quantity * watchedServices[index]?.unitPrice || 0)}
                            </div>
                            <div className="text-sm text-gray-500 bg-white px-3 py-2 rounded border">
                              {watchedServices[index]?.quantity || 0} × ${watchedServices[index]?.unitPrice || 0}
                            </div>
                          </div>
                        </div>
                     </div>

                                         {/* Service Info Card (if service is selected) - Mobile Optimized */}
                     {watchedServices[index]?.serviceId && (() => {
                       const selectedService = services.find(s => s.id === watchedServices[index]?.serviceId);
                       return selectedService ? (
                         <div className="bg-blue-50 rounded-lg p-4 lg:p-6 border border-blue-200">
                           <div className="flex items-start space-x-3 lg:space-x-4">
                             <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                               <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                             </div>
                             <div className="flex-1 min-w-0">
                               <h6 className="text-sm lg:text-base font-semibold text-blue-900 mb-1 lg:mb-2">
                                 {selectedService.name}
                               </h6>
                               {selectedService.description && (
                                 <p className="text-xs lg:text-sm text-blue-700 mb-2 lg:mb-3 leading-relaxed">
                                   {selectedService.description}
                                 </p>
                               )}
                               {/* Mobile Layout - Stacked */}
                               <div className="block lg:hidden space-y-2">
                                 <div className="flex items-center space-x-2 text-xs text-blue-600">
                                   <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                                   <span className="truncate">Category: {selectedService.category}</span>
                                 </div>
                                 <div className="flex items-center space-x-2 text-xs text-blue-600">
                                   <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                                   <span className="truncate">Standard Price: {formatCurrency(selectedService.price)}</span>
                                 </div>
                               </div>
                               {/* Desktop Layout - Horizontal */}
                               <div className="hidden lg:flex items-center space-x-4 text-xs text-blue-600">
                                 <span className="flex items-center space-x-1">
                                   <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                   <span>Category: {selectedService.category}</span>
                                 </span>
                                 <span className="flex items-center space-x-1">
                                   <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                   <span>Standard Price: {formatCurrency(selectedService.price)}</span>
                                 </span>
                               </div>
                             </div>
                           </div>
                         </div>
                       ) : null;
                     })()}
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
          <Input
            {...register('notes')}
            label="Notes"
            placeholder="Add any additional notes..."
            error={errors.notes?.message}
          />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4">Invoice Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%):</span>
              <span className="font-medium">{formatCurrency(calculateTax(calculateSubtotal()))}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span className="text-green-600">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Link href="/invoices">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? 'Creating...' : 'Create Invoice'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
