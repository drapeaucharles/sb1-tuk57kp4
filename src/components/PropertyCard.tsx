import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, TrendingUp, Shield } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

type BidStatus = 'leading' | 'outbid' | 'won' | 'lost' | 'canceled';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  minPrice: number;
  currentBid: number | null;
  deposit: number;
  image: string;
  rating: number;
  bids: number;
  daysLeft: number | null;
  isLeading?: boolean;
  onPlaceBid?: (propertyId: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  location,
  minPrice,
  currentBid,
  deposit,
  image,
  rating,
  bids,
  daysLeft,
  isLeading = false,
  onPlaceBid
}) => {
  const navigate = useNavigate();
  const formattedMinPrice = minPrice.toFixed(2);
  const formattedCurrentBid = currentBid ? currentBid.toFixed(2) : null;
  
  const fallbackImage = 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg';
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.target as HTMLImageElement;
    if (img.src !== fallbackImage) {
      img.src = fallbackImage;
    }
  };

  const handlePlaceBid = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/property/${id}?autoBid=true`);
  };
  
  return (
    <Card hover className="h-full flex flex-col">
      <div className="relative">
        <Link to={`/property/${id}`} className="block">
          <img 
            src={image || fallbackImage}
            alt={title} 
            className="w-full h-48 object-cover rounded-t-xl"
            onError={handleImageError}
            loading="lazy"
          />
        </Link>
        {isLeading && (
          <Badge 
            variant="warning" 
            className="absolute top-3 right-3"
          >
            You're Leading
          </Badge>
        )}
        {daysLeft !== null && daysLeft <= 3 && (
          <Badge 
            variant="danger" 
            className="absolute top-3 left-3"
          >
            {daysLeft === 0 ? 'Ends Today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}
          </Badge>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-white truncate">
            <Link to={`/property/${id}`} className="hover:text-indigo-400 transition-colors">
              {title}
            </Link>
          </h3>
          <div className="flex items-center ml-2">
            <Star size={14} className="text-amber-400 mr-1" />
            <span className="text-sm">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center mt-1 text-gray-400 text-sm">
          <MapPin size={14} className="mr-1" />
          <span>{location}</span>
        </div>
        
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-400">Min Price</p>
            <p className="font-medium text-gray-200">{formattedMinPrice} USDT</p>
          </div>
          
          <div>
            <p className="text-xs text-gray-400">Top Bid</p>
            {formattedCurrentBid ? (
              <p className={`font-medium ${isLeading ? 'text-amber-400' : 'text-emerald-400'}`}>
                {formattedCurrentBid} USDT
              </p>
            ) : (
              <p className="font-medium text-gray-300">No bids yet</p>
            )}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center">
            <TrendingUp size={14} className="mr-1" />
            <span>{bids} active {bids === 1 ? 'bid' : 'bids'}</span>
          </div>
          <div className="flex items-center">
            <Shield size={14} className="mr-1" />
            <span>Deposit: {deposit} USDT</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 pt-0 mt-auto">
        <Button 
          variant="primary" 
          fullWidth
          onClick={handlePlaceBid}
        >
          Place Bid
        </Button>
      </div>
    </Card>
  );
};

export default PropertyCard;