'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  Plus,
  Receipt,
  FolderOpen,
  X
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home, showOnMobile: false },
  { name: 'Invoices', href: '/invoices', icon: FileText, showOnMobile: false },
  { name: 'Customers', href: '/customers', icon: Users, showOnMobile: true },
  { name: 'Services', href: '/services', icon: Receipt, showOnMobile: true },
  { name: 'Templates', href: '/templates', icon: FolderOpen, showOnMobile: true },
  { name: 'Configuration', href: '/config', icon: Settings, showOnMobile: false },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="bg-white px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">Lab Service System</h1>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1 px-4 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
                // Hide items on mobile if showOnMobile is false
                !item.showOnMobile && 'lg:flex hidden'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="border-t border-gray-200 p-4">
        <div className="text-xs text-gray-500">
          Lab Service System v1.0
        </div>
      </div>
    </div>
  );
}
