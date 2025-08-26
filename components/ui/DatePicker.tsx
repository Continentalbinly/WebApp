'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  label?: string;
  value?: string;
  onChange?: (date: string) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(({
  label,
  value,
  onChange,
  error,
  className,
  placeholder = 'Select date',
  disabled = false,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    setCurrentDate(newDate);
    setIsOpen(false);
    
    if (onChange) {
      onChange(formatDate(newDate));
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    setIsOpen(false);
    
    if (onChange) {
      onChange(formatDate(today));
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
      const isToday = formatDate(date) === formatDate(new Date());
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={cn(
            'h-8 w-8 rounded-full text-sm font-medium transition-colors',
            'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            isSelected && 'bg-primary text-white hover:bg-primary/90',
            isToday && !isSelected && 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            !isSelected && !isToday && 'text-gray-900'
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          readOnly
          placeholder={placeholder}
          className={cn(
            'w-full h-10 px-3 py-2 pr-10',
            'border border-gray-300 rounded-md',
            'bg-white text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all duration-200',
            error && 'border-red-500 focus:ring-red-500',
            disabled && 'bg-gray-50 cursor-not-allowed opacity-60'
          )}
          disabled={disabled}
        />
        
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'absolute right-2 top-1/2 transform -translate-y-1/2',
            'p-1 text-gray-400 hover:text-gray-600',
            'transition-colors duration-200',
            disabled && 'cursor-not-allowed'
          )}
          disabled={disabled}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute z-50 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <button
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="text-sm font-medium text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            
            <button
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-3">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="h-8 w-8 flex items-center justify-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={goToToday}
              className="w-full px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-md transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;
