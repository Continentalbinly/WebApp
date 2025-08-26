'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getTemplates, addTemplate, updateTemplate, deleteTemplate } from '@/lib/storage';
import { InvoiceTemplate } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Modal from '@/components/ui/Modal';
import { FolderOpen, Plus, Edit, Trash2, Eye, X } from 'lucide-react';

const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  content: z.string().min(1, 'Template content is required'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InvoiceTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<InvoiceTemplate | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
  });

  const watchedContent = watch('content');

  // Function to replace template variables with sample data for preview
  const getPreviewContent = (content: string) => {
    // Sample services data for loops
    const sampleServices = [
      {
        name: 'Blood Test Analysis',
        description: 'Complete blood count and analysis',
        quantity: '2',
        unitPrice: '150.00',
        total: '300.00'
      },
      {
        name: 'Urine Analysis',
        description: 'Comprehensive urine testing',
        quantity: '1',
        unitPrice: '75.00',
        total: '75.00'
      },
      {
        name: 'X-Ray Examination',
        description: 'Chest X-ray with interpretation',
        quantity: '1',
        unitPrice: '200.00',
        total: '200.00'
      }
    ];

    // Replace loop syntax with actual HTML
    let processedContent = content
      .replace(/\{\{#each services\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, loopContent) => {
        return sampleServices.map(service => 
          loopContent
            .replace(/\{\{service\.name\}\}/g, service.name)
            .replace(/\{\{service\.description\}\}/g, service.description)
            .replace(/\{\{quantity\}\}/g, service.quantity)
            .replace(/\{\{unitPrice\}\}/g, service.unitPrice)
            .replace(/\{\{total\}\}/g, service.total)
        ).join('');
      });

    // Replace other variables
    processedContent = processedContent
      .replace(/\{\{invoiceNumber\}\}/g, 'INV-2024-001')
      .replace(/\{\{customerName\}\}/g, 'John Doe')
      .replace(/\{\{customerEmail\}\}/g, 'john.doe@example.com')
      .replace(/\{\{customerPhone\}\}/g, '+1 (555) 123-4567')
      .replace(/\{\{customerAddress\}\}/g, '123 Main Street, City, State 12345')
      .replace(/\{\{issueDate\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{dueDate\}\}/g, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString())
      .replace(/\{\{service\.name\}\}/g, 'Blood Test Analysis')
      .replace(/\{\{service\.description\}\}/g, 'Complete blood count and analysis')
      .replace(/\{\{quantity\}\}/g, '2')
      .replace(/\{\{unitPrice\}\}/g, '150.00')
      .replace(/\{\{total\}\}/g, '300.00')
      .replace(/\{\{subtotal\}\}/g, '575.00')
      .replace(/\{\{tax\}\}/g, '46.00')
      .replace(/\{\{taxRate\}\}/g, '8%')
      .replace(/\{\{grandTotal\}\}/g, '621.00')
      // Add better table formatting with mobile responsiveness
      .replace(/<table>/g, '<table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; overflow-x: auto; display: block;">')
      .replace(/<th>/g, '<th style="padding: 8px 12px; text-align: left; border-bottom: 2px solid #e5e7eb; background-color: #f9fafb; font-weight: 600; color: #374151; white-space: nowrap; min-width: 80px;">')
      .replace(/<td>/g, '<td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; word-wrap: break-word; max-width: 200px;">')
      .replace(/<tr>/g, '<tr style="border-bottom: 1px solid #f3f4f6;">');

    return processedContent;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadTemplates();
    }
  }, []);

  const loadTemplates = () => {
    try {
      const allTemplates = getTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      if (editingTemplate) {
        updateTemplate(editingTemplate.id, data);
      } else {
        addTemplate({ ...data, isDefault: false });
      }
      loadTemplates();
      reset();
      setShowModal(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleEdit = (template: InvoiceTemplate) => {
    setEditingTemplate(template);
    reset(template);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
      loadTemplates();
    }
  };

  const handlePreview = (template: InvoiceTemplate) => {
    setPreviewTemplate(template);
    setPreviewMode('desktop'); // Reset to desktop mode when opening preview
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading templates...</p>
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
            <FolderOpen className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Templates</h1>
              <p className="text-sm lg:text-base text-gray-600">Manage your invoice templates</p>
            </div>
          </div>
          <Button
            onClick={() => {
              setShowModal(true);
              setEditingTemplate(null);
              reset();
            }}
            className="flex items-center space-x-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Add Template</span>
          </Button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTemplate(null);
          reset();
        }}
        title={editingTemplate ? 'Edit Template' : 'Add New Template'}
        size="xl"
        className="z-50"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            {...register('name')}
            label="Template Name"
            placeholder="Enter template name"
            error={errors.name?.message}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Content (HTML)
            </label>
            <div className="space-y-4">
              <div>
                <Textarea
                  {...register('content')}
                  placeholder="Enter HTML template content..."
                  error={errors.content?.message}
                  className="font-mono text-sm"
                  rows={12}
                />
                <p className="mt-2 text-sm text-gray-500">
                  Use variables like {'{{invoiceNumber}}'}, {'{{customerName}}'}, etc.
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                                 <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-h-64 overflow-auto">
                   <div 
                     className="prose prose-sm max-w-none"
                     dangerouslySetInnerHTML={{ 
                       __html: watchedContent ? getPreviewContent(watchedContent) : '<p class="text-gray-500">Template preview will appear here...</p>' 
                     }}
                   />
                 </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingTemplate ? 'Update Template' : 'Add Template'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setEditingTemplate(null);
                reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 lg:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base lg:text-lg font-semibold text-gray-900">
            All Templates ({templates.length})
          </h3>
        </div>
        {templates.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {templates.map((template) => (
              <div key={template.id} className="px-4 lg:px-6 py-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base lg:text-lg font-medium text-gray-900 truncate">{template.name}</h4>
                      {template.isDefault && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary flex-shrink-0">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.content.length > 100 
                        ? `${template.content.substring(0, 100)}...` 
                        : template.content
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 sm:flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePreview(template)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sm:hidden ml-1">Preview</span>
                    </Button>
                    {!template.isDefault && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(template)}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sm:hidden ml-1">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(template.id)}
                          className="flex-1 sm:flex-none text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sm:hidden ml-1">Delete</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 lg:px-6 py-12 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-sm lg:text-base text-gray-600">Get started by adding your first template.</p>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-20 lg:pb-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] lg:max-h-[95vh] overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Eye className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900">
                      Template Preview
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {previewTemplate.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live Preview</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewTemplate(null)}
                    className="flex-shrink-0 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="relative">
                             {/* Preview Controls */}
               <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center space-x-4">
                     <span className="text-sm font-medium text-gray-700">Preview Mode:</span>
                     <div className="flex items-center space-x-2">
                       <button
                         onClick={() => setPreviewMode('desktop')}
                         className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                           previewMode === 'desktop'
                             ? 'bg-primary text-white'
                             : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                         }`}
                       >
                         Desktop
                       </button>
                       <button
                         onClick={() => setPreviewMode('mobile')}
                         className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                           previewMode === 'mobile'
                             ? 'bg-primary text-white'
                             : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                         }`}
                       >
                         Mobile
                       </button>
                     </div>
                   </div>
                   <div className="text-xs text-gray-500">
                     {new Date().toLocaleDateString()} • {new Date().toLocaleTimeString()}
                   </div>
                 </div>
               </div>
              
                             {/* Template Content */}
               <div className="p-6 lg:p-8 overflow-auto max-h-[calc(85vh-200px)] lg:max-h-[calc(95vh-200px)]">
                 <div className={`bg-white border border-gray-200 rounded-lg shadow-sm mx-auto transition-all duration-300 ${
                   previewMode === 'desktop' 
                     ? 'p-8 max-w-4xl' 
                     : 'p-4 max-w-sm'
                 }`}>
                   <div 
                     className={`prose max-w-none ${
                       previewMode === 'desktop' ? 'prose-lg' : 'prose-sm'
                     }`}
                     dangerouslySetInnerHTML={{ __html: getPreviewContent(previewTemplate.content) }}
                   />
                 </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
