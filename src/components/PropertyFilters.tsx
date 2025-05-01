import React, { useState, useRef } from 'react';
import { Search, Calendar, DollarSign, Filter, X, AlertCircle } from 'lucide-react';
import Input from './ui/Input';
import Button from './ui/Button';
import Select from './ui/Select';
import * as Dialog from '@radix-ui/react-dialog';
import BidCalendar from './BidCalendar';

interface PropertyFiltersProps {
  onFilter: (filters: {
    location: string;
    checkIn: string;
    checkOut: string;
    minPrice: string;
    maxPrice: string;
    propertyType: string;
  }) => void;
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ onFilter }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedInput, setSelectedInput] = useState<'checkIn' | 'checkOut' | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const checkInRef = useRef<HTMLInputElement>(null);
  const checkOutRef = useRef<HTMLInputElement>(null);
  
  const [filters, setFilters] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    minPrice: '',
    maxPrice: '',
    propertyType: ''
  });

  const handleChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDates()) {
      onFilter(filters);
    }
  };

  const validateDates = (): boolean => {
    if (filters.checkIn && filters.checkOut) {
      const checkIn = new Date(filters.checkIn);
      const checkOut = new Date(filters.checkOut);
      
      if (checkOut <= checkIn) {
        setDateError('Check-out date must be after check-in date');
        return false;
      }
    }
    setDateError(null);
    return true;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDateSelect = (dates: Array<{ date: string }>) => {
    if (dates.length > 0) {
      const selectedDate = new Date(dates[0].date);

      if (selectedInput === 'checkIn') {
        setFilters(prev => {
          const newState = { ...prev, checkIn: formatDate(selectedDate) };
          // Clear checkout if new check-in is after current checkout
          if (prev.checkOut && selectedDate >= new Date(prev.checkOut)) {
            newState.checkOut = '';
          }
          return newState;
        });
        setSelectedInput('checkOut');
      } else if (selectedInput === 'checkOut') {
        setFilters(prev => ({ ...prev, checkOut: formatDate(selectedDate) }));
        setIsCalendarOpen(false);
        setSelectedInput(null);
        validateDates();
      }
    }
  };

  // Generate available dates starting from today
  const availableDates = Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      minPrice: 100 + Math.floor(Math.random() * 100)
    };
  });

  const propertyTypeOptions = [
    { value: '', label: 'All Property Types' },
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'cabin', label: 'Cabin' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-4 shadow-md">
      <form onSubmit={handleSubmit}>
        {/* Main Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Where are you going?"
            value={filters.location}
            onChange={(e) => handleChange('location', e.target.value)}
            leftIcon={<Search size={18} />}
            fullWidth
          />
          
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Check in"
                value={filters.checkIn}
                onChange={() => {}}
                onFocus={() => {
                  setSelectedInput('checkIn');
                  setIsCalendarOpen(true);
                }}
                ref={checkInRef}
                leftIcon={<Calendar size={18} />}
                error={dateError}
                readOnly
                fullWidth
              />
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Check out"
                value={filters.checkOut}
                onChange={() => {}}
                onFocus={() => {
                  setSelectedInput('checkOut');
                  setIsCalendarOpen(true);
                }}
                ref={checkOutRef}
                leftIcon={<Calendar size={18} />}
                error={dateError}
                readOnly
                fullWidth
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              leftIcon={<Filter size={18} />}
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden flex-grow"
            >
              Filters
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-grow"
              disabled={dateError !== null}
            >
              Search
            </Button>
          </div>
        </div>
        
        {/* Expanded Filters */}
        <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ${isExpanded ? 'block' : 'hidden md:grid'}`}>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              leftIcon={<DollarSign size={18} />}
              fullWidth
            />
            <Input
              placeholder="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              leftIcon={<DollarSign size={18} />}
              fullWidth
            />
          </div>
          
          <Select
            options={propertyTypeOptions}
            value={filters.propertyType}
            onChange={(value) => handleChange('propertyType', value)}
            fullWidth
          />
          
          <div className="hidden md:block"></div>
        </div>

        {dateError && (
          <div className="mt-2 flex items-center text-rose-400 text-sm">
            <AlertCircle size={16} className="mr-1" />
            {dateError}
          </div>
        )}
      </form>

      {/* Calendar Dialog */}
      <Dialog.Root open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl p-6 w-[90vw] max-w-3xl z-[101]">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-white">
                {selectedInput === 'checkIn' ? 'Select Check-in Date' : 'Select Check-out Date'}
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-white">
                <X size={20} />
              </Dialog.Close>
            </div>
            
            <BidCalendar
              availableDates={availableDates}
              onBidChange={handleDateSelect}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default PropertyFilters;