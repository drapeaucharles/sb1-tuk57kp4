import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, DollarSign } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import Input from './ui/Input';
import Button from './ui/Button';

interface DayBid {
  date: string;
  minPrice: number;
  maxBid: number | null;
  isSelected: boolean;
  error?: string;
}

interface BidCalendarProps {
  availableDates: Array<{
    date: string;
    minPrice: number;
    currentBid?: number;
  }>;
  onBidChange: (bids: Array<{ date: string; amount: number }>) => void;
  deposit?: number;
  onConfirmBid?: () => void;
}

const BidCalendar: React.FC<BidCalendarProps> = ({ 
  availableDates, 
  onBidChange,
  deposit = 0,
  onConfirmBid
}) => {
  const startDate = new Date('2025-04-25');
  startDate.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    if (today < startDate) {
      return new Date(2025, 3, 1); // April 2025
    }
    return today;
  });

  const [selectedRange, setSelectedRange] = useState<{start: string | null; end: string | null}>({
    start: null,
    end: null
  });

  const [dayBids, setDayBids] = useState<DayBid[]>(() => 
    availableDates.map(day => ({
      date: day.date,
      minPrice: day.currentBid ? day.currentBid + 5 : day.minPrice,
      maxBid: null,
      isSelected: false
    }))
  );

  const updateBids = useCallback(() => {
    const validBids = dayBids
      .filter(bid => bid.isSelected && bid.maxBid !== null && !bid.error)
      .map(bid => ({
        date: bid.date,
        amount: Math.max(bid.maxBid || 0, bid.minPrice)
      }));
    
    onBidChange(validBids);
  }, [dayBids, onBidChange]);

  useEffect(() => {
    setDayBids(prevBids => {
      const newBids = availableDates.map(day => {
        const existingBid = prevBids.find(b => b.date === day.date);
        return {
          date: day.date,
          minPrice: day.currentBid ? day.currentBid + 5 : day.minPrice,
          maxBid: existingBid?.maxBid || null,
          isSelected: existingBid?.isSelected || false,
          error: existingBid?.error
        };
      });
      return newBids;
    });
  }, [availableDates]);

  useEffect(() => {
    updateBids();
  }, [dayBids, updateBids]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [maxBidAmount, setMaxBidAmount] = useState<string>('');
  const [bidError, setBidError] = useState<string | undefined>();
  
  const openBidDialog = (date: Date) => {
    setSelectedDate(date);
    setMaxBidAmount('');
    setBidError(undefined);
    setIsDialogOpen(true);
  };
  
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
  
  const isDateAvailable = (date: Date) => {
    if (!date) return false;
    
    date.setHours(0, 0, 0, 0);
    if (date < startDate) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.some(day => day.date === dateStr);
  };
  
  const getDayBid = (date: Date) => {
    if (!date) return null;
    const dateStr = date.toISOString().split('T')[0];
    return dayBids.find(day => day.date === dateStr);
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

  const setMinimumBidsForRange = () => {
    if (!selectedRange.start || !selectedRange.end) return;

    setDayBids(prevBids => {
      const newBids = prevBids.map(bid => {
        if (bid.isSelected) {
          const availableDate = availableDates.find(d => d.date === bid.date);
          const minPrice = availableDate?.currentBid 
            ? availableDate.currentBid + 5 
            : availableDate?.minPrice || 0;
          return {
            ...bid,
            maxBid: minPrice
          };
        }
        return bid;
      });
      return newBids;
    });
  };
  
  const toggleDateSelection = (date: Date) => {
    if (!isDateAvailable(date)) return;
    
    const dateStr = date.toISOString().split('T')[0];
    const availableDate = availableDates.find(day => day.date === dateStr);
    if (!availableDate) return;

    const dayBid = getDayBid(date);
    if (dayBid?.isSelected) {
      openBidDialog(date);
      return;
    }

    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: dateStr, end: null });
      setDayBids(prevBids => prevBids.map(bid => ({
        ...bid,
        isSelected: bid.date === dateStr,
        maxBid: null,
        error: undefined
      })));
    } else {
      if (dateStr < selectedRange.start) {
        setSelectedRange({ start: dateStr, end: selectedRange.start });
      } else {
        setSelectedRange({ start: selectedRange.start, end: dateStr });
      }

      setDayBids(prevBids => {
        const newBids = prevBids.map(bid => {
          const currentDate = new Date(bid.date);
          const isInRange = currentDate >= new Date(dateStr < selectedRange.start ? dateStr : selectedRange.start) &&
                          currentDate <= new Date(dateStr < selectedRange.start ? selectedRange.start : dateStr);
          
          if (isInRange) {
            const availableDate = availableDates.find(d => d.date === bid.date);
            const minPrice = availableDate?.currentBid 
              ? availableDate.currentBid + 5 
              : availableDate?.minPrice || 0;
            return {
              ...bid,
              isSelected: isInRange,
              maxBid: minPrice,
              error: undefined
            };
          }
          return bid;
        });
        return newBids;
      });
    }
  };
  
  const handleBidSubmit = () => {
    if (!selectedDate) return;
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const availableDate = availableDates.find(day => day.date === dateStr);
    if (!availableDate) return;
    
    const numericAmount = parseFloat(maxBidAmount);
    
    if (isNaN(numericAmount)) {
      setBidError('Please enter a valid amount');
      return;
    }
    
    const minRequiredBid = availableDate.currentBid 
      ? availableDate.currentBid + 5 
      : availableDate.minPrice + 5;

    if (numericAmount < minRequiredBid) {
      setBidError(`Minimum bid must be at least $${minRequiredBid} (${
        availableDate.currentBid ? 'current bid' : 'base price'
      } + $5)`);
      return;
    }

    setDayBids(prevBids => {
      const newBids = prevBids.map(bid => {
        if (bid.date === dateStr) {
          return {
            ...bid,
            maxBid: numericAmount,
            error: undefined
          };
        }
        return bid;
      });
      return newBids;
    });

    setIsDialogOpen(false);
  };
  
  const days = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const totalBidAmount = dayBids
    .filter(bid => bid.isSelected && bid.maxBid)
    .reduce((sum, bid) => sum + (bid.maxBid || 0), 0);

  const totalWithDeposit = totalBidAmount + deposit;
  
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
          const isAvailable = isDateAvailable(day);
          const dayBid = getDayBid(day);
          const isSelected = dayBid?.isSelected || false;
          const availableDate = availableDates.find(d => d.date === dateStr);
          const minPrice = availableDate?.currentBid 
            ? availableDate.currentBid + 5 
            : availableDate?.minPrice || 0;
          const maxBid = dayBid?.maxBid || null;
          const error = dayBid?.error;
          const isToday = day.toDateString() === startDate.toDateString();
          
          return (
            <div 
              key={day.toISOString()} 
              className={`
                relative aspect-square rounded-lg transition-all duration-200 p-3
                ${isAvailable 
                  ? 'bg-gray-700/50 hover:bg-gray-700 cursor-pointer' 
                  : 'bg-gray-800/30 opacity-50 cursor-not-allowed'}
                ${isSelected ? 'bg-indigo-900/70 ring-2 ring-indigo-500' : ''}
                ${isToday ? 'ring-2 ring-indigo-400/50' : ''}
                ${error ? 'ring-2 ring-rose-500' : ''}
              `}
              onClick={() => isAvailable && toggleDateSelection(day)}
            >
              <div className="h-full flex flex-col items-center justify-center">
                <div className={`text-sm ${isToday ? 'text-indigo-400 font-medium' : 'text-gray-300'}`}>
                  {day.getDate()}
                </div>
                
                {isAvailable && (
                  <div className="text-xs mt-1">
                    {isSelected && maxBid ? (
                      <span className={error ? 'text-rose-400' : 'text-emerald-400'}>
                        ${maxBid}
                      </span>
                    ) : (
                      <span className="text-gray-400">${minPrice}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 border-t border-gray-700 pt-6">
        <h4 className="text-sm font-medium text-white mb-3">Selected Dates</h4>
        {!selectedRange.start ? (
          <p className="text-sm text-gray-400">Select your check-in date to begin.</p>
        ) : !selectedRange.end ? (
          <p className="text-sm text-gray-400">Now select your check-out date.</p>
        ) : (
          <div className="space-y-2">
            {dayBids
              .filter(bid => bid.isSelected)
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(bid => (
                <div 
                  key={bid.date} 
                  className={`flex justify-between items-center p-2 rounded-lg ${
                    bid.error ? 'bg-rose-900/30 border border-rose-700' : 'bg-gray-700/30'
                
                  }`}
                  onClick={() => openBidDialog(new Date(bid.date))}
                  role="button"
                  tabIndex={0}
                >
                  <span className="text-sm text-gray-300">
                    {new Date(bid.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400">Min: ${bid.minPrice}</span>
                    {bid.maxBid !== null && (
                      <span className={`text-sm font-medium ${bid.error ? 'text-rose-400' : 'text-emerald-400'}`}>
                        Max: ${bid.maxBid}
                      </span>
                    )}
                  </div>
                </div>
              ))
            }

            {deposit > 0 && (
              <div className="mt-4 p-3 bg-indigo-900/30 border border-indigo-800 rounded-lg">
                <p className="text-sm text-indigo-200">
                  Security deposit: ${deposit} USDT
                  <br />
                  Deposit will be refunded to your wallet 3 days after check-out.
                </p>
              </div>
            )}

            {dayBids.some(bid => bid.isSelected) && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Bid Amount:</span>
                    <span className="text-xl font-semibold text-emerald-400">
                      ${totalWithDeposit.toFixed(2)} USDT
                    </span>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  fullWidth
                  onClick={onConfirmBid}
                >
                  Place Bid (${totalWithDeposit.toFixed(2)} total)
                </Button>

                <p className="text-center text-xs text-gray-500">
                  Only winning bids have funds frozen. Funds return instantly if outbid.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl p-6 w-[90vw] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium text-white">
                Set Maximum Bid
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-white">
                <X size={20} />
              </Dialog.Close>
            </div>

            {selectedDate && (
              <>
                <div className="mb-4">
                  <p className="text-gray-300">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Minimum bid: ${getDayBid(selectedDate)?.minPrice}
                  </p>
                </div>

                <div className="mb-6">
                  <Input
                    type="number"
                    label="Maximum Bid Amount"
                    value={maxBidAmount}
                    onChange={(e) => setMaxBidAmount(e.target.value)}
                    error={bidError}
                    placeholder="Enter your maximum bid"
                    fullWidth
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Dialog.Close asChild>
                    <Button variant="ghost">Cancel</Button>
                  </Dialog.Close>
                  <Button variant="primary" onClick={handleBidSubmit}>
                    Set Maximum Bid
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

export default BidCalendar;