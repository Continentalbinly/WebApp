'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getServices, addService, updateService, deleteService } from '@/lib/storage';
import { Service } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { Receipt, Plus, Edit, Trash2, Search, DollarSign, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  category: z.string().min(1, 'Category is required'),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const serviceCategories = [
  { value: 'laboratory', label: 'Laboratory Testing' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'equipment', label: 'Equipment Rental' },
  { value: 'analysis', label: 'Data Analysis' },
  { value: 'other', label: 'Other' },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadServices();
    }
  }, []);

  const loadServices = () => {
    try {
      const allServices = getServices();
      setServices(allServices);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      if (editingService) {
        updateService(editingService.id, data);
      } else {
        addService(data);
      }
      loadServices();
      reset();
      setShowModal(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    reset(service);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      setDeletingId(id);
      try {
        deleteService(id);
        loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading services...</p>
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
            <Receipt className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Services</h1>
              <p className="text-sm lg:text-base text-gray-600">Manage your lab services and pricing</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowModal(true);
              setEditingService(null);
              reset();
            }}
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Service</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <Select
              options={[
                { value: 'all', label: 'All Categories' },
                ...serviceCategories
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Filter by category"
            />
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingService(null);
          reset();
        }}
        title={editingService ? 'Edit Service' : 'Add New Service'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              {...register('name')}
              label="Service Name"
              placeholder="Enter service name"
              error={errors.name?.message}
            />
            <Input
              {...register('price', { valueAsNumber: true })}
              label="Price"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.price?.message}
            />
            <Select
              {...register('category')}
              label="Category"
              options={serviceCategories}
              error={errors.category?.message}
              placeholder="Select a category"
              onBlur={() => {}}
            />
          </div>
          <div>
            <Input
              {...register('description')}
              label="Description"
              placeholder="Enter service description"
              error={errors.description?.message}
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingService ? 'Update Service' : 'Add Service'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingService(null);
                reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Services List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base lg:text-lg font-semibold text-gray-900">
              All Services ({filteredServices.length})
            </h3>
            {filteredServices.length > 0 && (
              <div className="text-sm text-gray-500">
                Total Value: {formatCurrency(filteredServices.reduce((sum, service) => sum + service.price, 0))}
              </div>
            )}
          </div>
        </div>
        {filteredServices.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredServices.map((service) => (
              <div key={service.id} className="px-4 lg:px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base lg:text-lg font-medium text-gray-900 truncate">{service.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {service.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-lg font-semibold text-green-600">
                        {formatCurrency(service.price)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 lg:flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(service.id)}
                      loading={deletingId === service.id}
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
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-sm lg:text-base text-gray-600">
              {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your search terms or filters.' : 'Get started by adding your first service.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
