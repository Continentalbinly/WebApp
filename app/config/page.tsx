'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getConfig, updateConfig } from '@/lib/storage';
import { Config } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Save, Settings, FolderOpen, FileText, Mail, Calendar } from 'lucide-react';

const configSchema = z.object({
  main_folder_id: z.string().min(1, 'Main folder ID is required'),
  template_invoice_id: z.string().min(1, 'Template invoice ID is required'),
  default_due_days: z.number().min(1, 'Default due days must be at least 1'),
  admin_email: z.string().email('Please enter a valid email address'),
  invoice_prefix: z.string().min(1, 'Invoice prefix is required'),
});

type ConfigFormData = z.infer<typeof configSchema>;

export default function ConfigPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
  });

  useEffect(() => {
    const config = getConfig();
    reset(config);
  }, [reset]);

  const onSubmit = async (data: ConfigFormData) => {
    setIsLoading(true);
    setMessage('');

    try {
      updateConfig(data);
      setMessage('Configuration updated successfully!');
    } catch (error) {
      setMessage('Error updating configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const configSections = [
    {
      title: 'Folder Configuration',
      description: 'Configure your main folder and template locations',
      icon: FolderOpen,
      fields: [
        {
          name: 'main_folder_id' as keyof Config,
          label: 'Main Folder ID',
          placeholder: 'Enter your main folder ID from Google Drive',
          description: 'This is the ID of your main Lab-Service-System folder in Google Drive',
        },
        {
          name: 'template_invoice_id' as keyof Config,
          label: 'Template Invoice ID',
          placeholder: 'Enter your invoice template file ID',
          description: 'This is the ID of your invoice template Google Docs file',
        },
      ],
    },
    {
      title: 'Invoice Settings',
      description: 'Configure default invoice settings',
      icon: FileText,
      fields: [
        {
          name: 'invoice_prefix' as keyof Config,
          label: 'Invoice Prefix',
          placeholder: 'INV-',
          description: 'Prefix for automatically generated invoice numbers',
        },
        {
          name: 'default_due_days' as keyof Config,
          label: 'Default Due Days',
          placeholder: '15',
          description: 'Default number of days until payment is due',
          type: 'number',
        },
      ],
    },
    {
      title: 'Administration',
      description: 'Configure administrative settings',
      icon: Settings,
      fields: [
        {
          name: 'admin_email' as keyof Config,
          label: 'Admin Email',
          placeholder: 'admin@example.com',
          description: 'Email address for system notifications and admin access',
        },
      ],
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
        </div>
        <p className="text-gray-600">
          Manage your system configuration settings. These settings control how your Lab Service System operates.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {configSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-6">
              <section.icon className="h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                <p className="text-gray-600">{section.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.fields.map((field, fieldIndex) => (
                <div key={fieldIndex}>
                  <Input
                    {...register(field.name)}
                    label={field.label}
                    placeholder={field.placeholder}
                    type={field.type || 'text'}
                    error={errors[field.name]?.message}
                  />
                  <p className="mt-1 text-sm text-gray-500">{field.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Save Configuration</h3>
              <p className="text-gray-600 text-sm lg:text-base">Click save to update your configuration settings</p>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full lg:w-auto flex items-center justify-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? 'Saving...' : 'Save Configuration'}</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4 lg:p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Find IDs</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Finding Main Folder ID:</h4>
            <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
              <li>Go to your Google Drive</li>
              <li>Navigate to your Lab-Service-System folder</li>
              <li className="break-words">
                Copy the ID from the URL: 
                <div className="mt-1 ml-4">
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs break-all block">
                    https://drive.google.com/drive/folders/YOUR_FOLDER_ID
                  </code>
                </div>
              </li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium text-blue-800 mb-2">Finding Template Invoice ID:</h4>
            <ol className="list-decimal list-inside text-blue-700 space-y-1 text-sm">
              <li>Open your invoice template Google Docs file</li>
              <li className="break-words">
                Copy the ID from the URL: 
                <div className="mt-1 ml-4">
                  <code className="bg-blue-100 px-2 py-1 rounded text-xs break-all block">
                    https://docs.google.com/document/d/YOUR_FILE_ID/edit
                  </code>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
