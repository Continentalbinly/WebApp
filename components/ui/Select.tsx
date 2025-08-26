'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onBlur?: (e?: any) => void;
  name?: string;
  disabled?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  placeholder = 'Select an option',
  className,
  value,
  onChange,
  onBlur,
  name,
  disabled = false,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    options.find(option => option.value === value) || null
  );
  const selectRef = useRef<HTMLDivElement>(null);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedOption(options.find(option => option.value === value) || null);
  }, [value, options]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option: SelectOption) => {
    setSelectedOption(option);
    setIsOpen(false);
    
    // Create a proper event object for react-hook-form
    const event = { target: { value: option.value } };
    
    if (onChange) {
      onChange(event);
    }
    if (onBlur) {
      onBlur(event);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    } else if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div
        ref={selectRef}
        className={cn(
          'relative w-full',
          'border border-gray-300 rounded-md',
          'bg-white',
          'focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent',
          'transition-all duration-200',
          error && 'border-red-500 focus-within:ring-red-500',
          disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
        )}
      >
        <button
          type="button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full px-3 py-2 text-left',
            'flex items-center justify-between',
            'focus:outline-none',
            'min-h-[40px]',
            'text-sm',
            selectedOption ? 'text-gray-900' : 'text-gray-500',
            disabled && 'cursor-not-allowed'
          )}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? `${name}-label` : undefined}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Hidden select for form compatibility */}
        <select
          ref={ref}
          name={name}
          value={value || ''}
          onChange={(e) => {
            if (onChange) {
              onChange(e);
            }
          }}
          onBlur={(e) => {
            if (onBlur) {
              onBlur(e);
            }
          }}
          className="sr-only"
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="py-1" role="listbox">
              {options.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options available
                </div>
              ) : (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionClick(option)}
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm',
                      'hover:bg-gray-100 focus:bg-gray-100',
                      'focus:outline-none transition-colors duration-150',
                      'flex items-center justify-between',
                      'min-h-[40px]', // Touch-friendly height
                      selectedOption?.value === option.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-900'
                    )}
                    role="option"
                    aria-selected={selectedOption?.value === option.value}
                  >
                    <span className="truncate">{option.label}</span>
                    {selectedOption?.value === option.value && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
