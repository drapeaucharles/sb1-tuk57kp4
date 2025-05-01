import React from 'react';
import { Calendar, MapPin, DollarSign } from 'lucide-react';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { BidStatus } from '../lib/bids';
import { cancelBidAndRefund } from '../lib/bids';

interface BidHistoryItemProps {
  id: string;
  propertyName: string;
  propertyImage: string;
  location: string;
  dates: {
    checkIn: string;
    checkOut: string;
  };
  totalBid: number;
  depositAmount: number;
  status: BidStatus;
  onStatusChange?: (id: string, newStatus: BidStatus) => void;
}

const BidHistoryItem: React.FC<BidHistoryItemProps> = ({
  id,
  propertyName,
  propertyImage,
  location,
  dates,
  totalBid,
  depositAmount,
  status,
  onStatusChange
}) => {
  const getBadgeVariant = (): 'success' | 'warning' | 'danger' | 'default' => {
    switch (status) {
      case 'active': return 'success';
      case 'over_bid': return 'warning';
      case 'won': return 'success';
      case 'canceled': return 'default';
      case 'confirmed': return 'success';
      default: return 'default';
    }
  };
  
  const getStatusText = (): string => {
    switch (status) {
      case 'active': return 'Active Bid';
      case 'over_bid': return 'Outbid';
      case 'won': return 'Won';
      case 'canceled': return 'Canceled';
      case 'confirmed': return 'Confirmed';
      default: return 'Unknown';
    }
  };

  const handleCancel = async () => {
    try {
      await cancelBidAndRefund(id);
      if (onStatusChange) {
        onStatusChange(id, 'canceled');
      }
    } catch (error) {
      console.error('Failed to cancel bid:', error);
      alert('Failed to cancel bid. Please try again.');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 md:w-1/5 flex-shrink-0">
          <img 
            src={propertyImage} 
            alt={propertyName}
            className="w-full h-full sm:h-48 object-cover"
          />
        </div>
        
        <div className="p-4 sm:p-5 flex-grow">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-start">
                <h3 className="text-lg font-medium text-white">{propertyName}</h3>
                <Badge 
                  variant={getBadgeVariant()} 
                  className="ml-3"
                >
                  {getStatusText()}
                </Badge>
              </div>
              
              <div className="flex items-center mt-1 text-gray-400 text-sm">
                <MapPin size={14} className="mr-1" />
                <span>{location}</span>
              </div>
              
              <div className="flex items-center mt-3 text-gray-300 text-sm">
                <Calendar size={14} className="mr-1" />
                <span>
                  {formatDate(dates.checkIn)} - {formatDate(dates.checkOut)}
                </span>
              </div>
              
              <div className="mt-3 space-y-1">
                <div className="flex items-center text-gray-200">
                  <DollarSign size={16} className="mr-1 text-emerald-400" />
                  <span className="font-medium">{totalBid.toFixed(2)} USDT</span>
                  <span className="text-sm text-gray-400 ml-2">total bid</span>
                </div>
                <div className="flex items-center text-gray-200">
                  <DollarSign size={16} className="mr-1 text-amber-400" />
                  <span className="font-medium">{depositAmount.toFixed(2)} USDT</span>
                  <span className="text-sm text-gray-400 ml-2">deposited</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 md:min-w-36">
              {status === 'active' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/property/${id}`}
                  >
                    Increase Bid
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleCancel}
                  >
                    Cancel Bid
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = `/property/${id}`}
              >
                View Property
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidHistoryItem;