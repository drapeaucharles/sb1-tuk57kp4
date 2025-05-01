import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, DollarSign, Ban } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import Input from './ui/Input';
import Button from './ui/Button';

interface DayAvailability {
  date: string;
  price: number;
  isAvailable: boolean;
}

interface HostCalendarProps {
  availableDates: Array<{
    date: string;
    price: number;
  }>;
  onAvailabilityChange: (dates: Array<{ date: string; price: number }>) => void;
}

const HostCalendar: React.FC<HostCalendarProps> = ({ availableDates, onAvailabilityChange }) => {
  const startDate = new Date('2025-04-25');
  startDate.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    if (today < startDate) {
      return new Date(2025, 3, 1); // April 2025
    }
    return today;
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [priceInput, setPriceInput] = useState<string>('');
  const [priceError, setPriceError] = useState<string | undefined>();
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  
  // Initialize availability state from props
  const [daysAvailability, setDaysAvailability] = useState<DayAvailability[]>(() => {
    const allDays: DayAvailability[] = [];
    const currentDate = new Date(startDate);
    const endDate = new Date(2025, 11, 31); // End of 2025
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingDate = availableDates.find(d => d.date === dateStr);
      
      allDays.push({
        date: dateStr,
        price: existingDate?.price || 100,
        isAvailable: !!existingDate
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return allDays;
  });

  // Update local state when props change
  useEffect(() => {
    setDaysAvailability(prev => {
      const newDays = [...prev];
      availableDates.forEach(date => {
        const index = newDays.findIndex(day => day.date === date.date);
        if (index !== -1) {
          newDays[index] = {
            ...newDays[index],
            price: date.price,
            isAvailable: true
          };
        }
      });
      return newDays;
    });
  }, [availableDates]);
  
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysArray = [];
    
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      daysArray.push(date);
    }

    const remainingSlots = (7 - ((daysArray.length) % 7)) % 7;
    for (let i = 0; i < remainingSlots; i++) {
      daysArray.push(null);
    }
    
    return daysArray;
  };
  
  const getDayAvailability = (date: Date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return daysAvailability.find(day => day.date === dateStr);
  };

  const isDateInRange = (date: Date) => {
    if (!selectedRange.start || !selectedRange.end) return false;
    
    const compareDate = new Date(date.toISOString().split('T')[0]);
    const start = new Date(selectedRange.start.toISOString().split('T')[0]);
    const end = new Date(selectedRange.end.toISOString().split('T')[0]);
    
    // Handle selection in either direction
    const rangeStart = start <= end ? start : end;
    const rangeEnd = start <= end ? end : start;
    
    // Include both start and end dates in the range
    return compareDate >= rangeStart && compareDate <= rangeEnd;
  };
  
  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (newDate >= new Date(2025, 3, 1)) {
      setCurrentMonth(newDate);
    }
  };
  
  const handleNextMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (newDate.getFullYear() <= 2025 && newDate.getMonth() <= 11) {
      setCurrentMonth(newDate);
    }
  };

  const updateAvailability = (newDays: DayAvailability[]) => {
    setDaysAvailability(newDays);
    
    // Extract available dates for the callback
    const availableDays = newDays
      .filter(day => day.isAvailable)
      .map(day => ({
        date: day.date,
        price: day.price
      }));
    
    // Update database
    onAvailabilityChange(availableDays);
  };

  const handlePriceSubmit = () => {
    if (!selectedRange.start || !selectedRange.end) return;
    
    const numericPrice = parseFloat(priceInput);
    
    if (isNaN(numericPrice)) {
      setPriceError('Please enter a valid price');
      return;
    }
    
    if (numericPrice <= 0) {
      setPriceError('Price must be greater than 0');
      return;
    }

    // Use ISO string dates for consistent comparison
    const start = new Date(selectedRange.start.toISOString().split('T')[0]);
    const end = new Date(selectedRange.end.toISOString().split('T')[0]);
    
    // Handle selection in either direction
    const rangeStart = start <= end ? start : end;
    const rangeEnd = start <= end ? end : start;

    const newDays = daysAvailability.map(day => {
      const currentDate = new Date(day.date);
      
      if (currentDate >= rangeStart && currentDate <= rangeEnd) {
        return {
          ...day,
          price: numericPrice,
          isAvailable: true
        };
      }
      return day;
    });

    updateAvailability(newDays);
    setIsDialogOpen(false);
    setSelectedRange({ start: null, end: null });
  };

  const handleDateClick = (date: Date) => {
    if (!date || date < startDate) return;

    // Use ISO string date for consistent comparison
    const clickedDate = new Date(date.toISOString().split('T')[0]);

    if (!selectedRange.start) {
      // First click - start new range
      setSelectedRange({ start: clickedDate, end: null });
    } else if (!selectedRange.end) {
      // Second click - complete range and open dialog
      const start = new Date(selectedRange.start.toISOString().split('T')[0]);
      
      // Ensure start is before end
      if (clickedDate < start) {
        setSelectedRange({ start: clickedDate, end: start });
      } else {
        setSelectedRange({ start, end: clickedDate });
      }
      setIsDialogOpen(true);
      setPriceInput('100');
    } else {
      // Reset and start new range
      setSelectedRange({ start: clickedDate, end: null });
    }
  };

  const toggleDateRange = () => {
    if (!selectedRange.start || !selectedRange.end) return;
    
    // Use ISO string dates for consistent comparison
    const start = new Date(selectedRange.start.toISOString().split('T')[0]);
    const end = new Date(selectedRange.end.toISOString().split('T')[0]);
    
    // Handle selection in either direction
    const rangeStart = start <= end ? start : end;
    const rangeEnd = start <= end ? end : start;

    // Check if any date in range is available
    const hasAvailable = daysAvailability.some(day => {
      const currentDate = new Date(day.date);
      return currentDate >= rangeStart && currentDate <= rangeEnd && day.isAvailable;
    });

    // Toggle availability for all dates in range
    const newDays = daysAvailability.map(day => {
      const currentDate = new Date(day.date);
      
      if (currentDate >= rangeStart && currentDate <= rangeEnd) {
        return {
          ...day,
          isAvailable: !hasAvailable
        };
      }
      return day;
    });

    updateAvailability(newDays);
    setSelectedRange({ start: null, end: null });
  };
  
  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <button 
          className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700" 
          onClick={handlePrevMonth}
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-xl font-medium text-white">{monthName} {year}</h3>
        <button 
          className="p-3 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700" 
          onClick={handleNextMonth}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-3 mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="text-center text-sm text-gray-400 font-medium pb-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square bg-gray-850/50 rounded-lg" />;
          }
          
          const dateStr = day.toISOString().split('T')[0];
          const dayAvailability = getDayAvailability(day);
          const isAvailable = dayAvailability?.isAvailable || false;
          const price = dayAvailability?.price || 0;
          const isToday = day.toDateString() === startDate.toDateString();
          const isPast = day < startDate;
          const isSelected = isDateInRange(day);
          const isRangeStart = selectedRange.start?.toISOString().split('T')[0] === dateStr;
          const isRangeEnd = selectedRange.end?.toISOString().split('T')[0] === dateStr;
          
          return (
            <div 
              key={day.toISOString()} 
              className={`
                relative aspect-square rounded-lg transition-all duration-200 p-3 cursor-pointer
                ${isPast ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSelected ? 'bg-indigo-900/50 hover:bg-indigo-900/70' : ''}
                ${!isSelected && isAvailable ? 'bg-emerald-900/30 hover:bg-emerald-900/50' : ''}
                ${!isSelected && !isAvailable ? 'bg-gray-700/30 hover:bg-gray-700/50' : ''}
                ${(isRangeStart || isRangeEnd) ? 'ring-2 ring-indigo-500' : ''}
                ${isToday ? 'ring-2 ring-indigo-400/50' : ''}
              `}
              onClick={() => !isPast && handleDateClick(day)}
            >
              <div className="h-full flex flex-col items-center justify-center">
                <div className={`text-sm ${isToday ? 'text-indigo-400 font-medium' : 'text-gray-300'}`}>
                  {day.getDate()}
                </div>
                
                {!isPast && (
                  <div className="text-xs mt-1">
                    {isAvailable ? (
                      <span className="text-emerald-400">${price}</span>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <Ban size={12} className="mr-1" />
                        <span>Blocked</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-gray-700 pt-6">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-emerald-900/30 rounded mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-700/30 rounded mr-2"></div>
              <span>Blocked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-indigo-900/50 rounded mr-2"></div>
              <span>Selected</span>
            </div>
          </div>
          
          {selectedRange.start && selectedRange.end && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDateRange}
            >
              Block Selected Dates
            </Button>
          )}
        </div>
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl p-6 w-[90vw] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-white">
                Set Price for Selected Dates
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-white">
                <X size={20} />
              </Dialog.Close>
            </div>

            {selectedRange.start && selectedRange.end && (
              <>
                <div className="mb-4">
                  <p className="text-gray-300">
                    {selectedRange.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} 
                    {' '}-{' '}
                    {selectedRange.end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    {Math.floor(Math.abs(selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24) + 1)} days selected
                  </p>
                </div>

                <div className="mb-6">
                  <Input
                    type="number"
                    label="Price per Night"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    error={priceError}
                    placeholder="Enter price"
                    leftIcon={<DollarSign size={18} />}
                    fullWidth
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Dialog.Close asChild>
                    <Button variant="ghost">Cancel</Button>
                  </Dialog.Close>
                  <Button variant="primary" onClick={handlePriceSubmit}>
                    Set Price & Make Available
                  </Button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default HostCalendar;