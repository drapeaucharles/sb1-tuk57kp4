import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, TrendingUp, Calendar, DollarSign, AlertCircle, Check, Clock, Share2, Heart, User, Wallet, CreditCard, X } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import BidCalendar from '../components/BidCalendar';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuthStore } from '../store/authStore';
import LoginModal from '../components/auth/LoginModal';

type Property = Database['public']['Tables']['properties']['Row'];

interface HighestBid {
  date: string;
  bid_price: number;
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [highestBids, setHighestBids] = useState<Record<string, number>>({});
  const [selectedDates, setSelectedDates] = useState<Array<{ date: string; amount: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userId, userRole, paymentMethod, setPaymentMethod } = useAuthStore();
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Fetch property details and set up bid subscription
  useEffect(() => {
    let subscription: any;

    async function fetchPropertyAndBids() {
      if (!id) return;

      try {
        // Fetch property details
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (propertyError) throw propertyError;
        setProperty(propertyData);

        // Initial fetch of highest bids
        const { data: bids, error: bidsError } = await supabase
          .from('bids')
          .select('nights')
          .eq('property_id', id)
          .eq('status', 'pending');

        if (bidsError) throw bidsError;

        // Calculate initial highest bids
        const highestBidsMap: Record<string, number> = {};
        bids?.forEach(bid => {
          (bid.nights as Array<{ date: string; bid_price: number }>).forEach(night => {
            if (!highestBidsMap[night.date] || night.bid_price > highestBidsMap[night.date]) {
              highestBidsMap[night.date] = night.bid_price;
            }
          });
        });

        setHighestBids(highestBidsMap);

        // Subscribe to bid changes
        subscription = supabase
          .channel('bids-channel')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bids',
              filter: `property_id=eq.${id}`
            },
            async (payload) => {
              // Only update highest bids when changes occur
              const { data: updatedBids, error: updatedBidsError } = await supabase
                .from('bids')
                .select('nights')
                .eq('property_id', id)
                .eq('status', 'pending');

              if (!updatedBidsError && updatedBids) {
                const updatedHighestBids: Record<string, number> = {};
                updatedBids.forEach(bid => {
                  (bid.nights as Array<{ date: string; bid_price: number }>).forEach(night => {
                    if (!updatedHighestBids[night.date] || night.bid_price > updatedHighestBids[night.date]) {
                      updatedHighestBids[night.date] = night.bid_price;
                    }
                  });
                });
                setHighestBids(updatedHighestBids);
              }
            }
          )
          .subscribe();

      } catch (err) {
        console.error('Error fetching property details:', err);
        setError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    }

    fetchPropertyAndBids();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [id]);

  // Memoize available dates with bids to prevent unnecessary re-renders
  const availableDatesWithBids = useMemo(() => {
    if (!property?.available_dates) return [];
    return (property.available_dates as any[]).map(d => ({
      date: d.date,
      minPrice: d.price,
      currentBid: highestBids[d.date]
    }));
  }, [property?.available_dates, highestBids]);

  const handleBidChange = (bids: Array<{ date: string; amount: number }>) => {
    // Only update if the bids have actually changed
    if (JSON.stringify(bids) !== JSON.stringify(selectedDates)) {
      setSelectedDates(bids);
    }
  };

  const handlePlaceBid = () => {
    if (!userId) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!property || selectedDates.length === 0) return;
    setShowPaymentModal(true);
  };

  const handleConfirmBid = async () => {
    if (!property || selectedDates.length === 0) return;

    setIsPaying(true);
    try {
      const totalAmount = selectedDates.reduce((sum, d) => sum + d.amount, 0);
      const depositAmount = property.deposit || 0;

      const bidPayload = {
        property_id: property.id,
        user_id: userId,
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        nights: selectedDates.map(d => ({ date: d.date, bid_price: d.amount })),
        status: 'pending'
      };

      const { error } = await supabase.from('bids').insert(bidPayload);
      
      if (error) {
        throw error;
      }

      alert('✅ Bid confirmed!');
      navigate('/bids');
    } catch (err) {
      console.error('Error placing bid:', err);
      alert('❌ Failed to place bid. Please try again.');
    } finally {
      setIsPaying(false);
      setShowPaymentModal(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-800 rounded-xl mb-8"></div>
            <div className="h-8 bg-gray-800 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
              <div className="h-4 bg-gray-800 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Failed to Load Property</h2>
            <p className="text-gray-400 mb-6">{error || 'Property not found'}</p>
            <Link to="/browse">
              <Button variant="primary">Browse Other Properties</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const totalBidAmount = selectedDates.reduce((sum, d) => sum + d.amount, 0);
  const totalWithDeposit = totalBidAmount + (property.deposit || 0);

  return (
    <Layout>
      {/* Property Images */}
      <section className="pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-2/3">
              <img 
                src={(property.images as string[])?.[0] || 'https://via.placeholder.com/800x600?text=No+Image'} 
                alt={property.title} 
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
            <div className="md:w-1/3 grid grid-cols-2 gap-4">
              {(property.images as string[])?.slice(1, 5).map((image, index) => (
                <img 
                  key={index}
                  src={image} 
                  alt={`${property.title} - ${index + 2}`} 
                  className="w-full h-44 object-cover rounded-xl"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Property Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="lg:w-2/3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-400">
                    <MapPin size={16} className="mr-1" />
                    <span>{property.location}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-white bg-gray-800 rounded-full">
                    <Share2 size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-rose-500 bg-gray-800 rounded-full">
                    <Heart size={18} />
                  </button>
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-gray-300 leading-relaxed">
                  {property.description}
                </p>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Select Your Dates</h2>
                <BidCalendar 
                  availableDates={availableDatesWithBids}
                  onBidChange={handleBidChange}
                  deposit={property.deposit}
                  onConfirmBid={handlePlaceBid}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Method Modal */}
      <Dialog.Root open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-xl p-6 w-[90vw] max-w-md z-[101]">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="text-lg font-medium text-white">
                Choose Payment Method
              </Dialog.Title>
              <Dialog.Close className="text-gray-400 hover:text-white">
                <X size={20} />
              </Dialog.Close>
            </div>

            <div className="space-y-4 mb-6">
              <label className="flex items-center p-4 bg-gray-900 rounded-lg cursor-pointer border border-gray-700 hover:border-indigo-500 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="crypto"
                  checked={paymentMethod === 'crypto'}
                  onChange={() => setPaymentMethod('crypto')}
                  className="mr-3"
                />
                <Wallet size={20} className="text-indigo-400 mr-3" />
                <div>
                  <p className="font-medium text-white">Crypto Wallet (USDT)</p>
                  <p className="text-sm text-gray-400">Pay and receive refunds directly to your wallet</p>
                </div>
              </label>

              <label className="flex items-center p-4 bg-gray-900 rounded-lg cursor-not-allowed opacity-60 border border-gray-700">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  disabled
                  className="mr-3"
                />
                <CreditCard size={20} className="text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-white">Credit Card</p>
                  <p className="text-sm text-gray-400">Coming Soon</p>
                </div>
              </label>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Total Bid Amount:</span>
                <span className="text-lg font-medium text-white">${totalBidAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Security Deposit:</span>
                <span className="text-lg font-medium text-white">${property.deposit?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                <span className="font-medium text-white">Total to Lock:</span>
                <span className="text-xl font-bold text-emerald-400">${totalWithDeposit.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Dialog.Close asChild>
                <Button variant="ghost">Cancel</Button>
              </Dialog.Close>
              <Button 
                variant="primary"
                onClick={handleConfirmBid}
                disabled={!paymentMethod || isPaying}
                isLoading={isPaying}
              >
                {isPaying ? 'Confirming...' : 'Confirm Bid'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </Layout>
  );
};

export default PropertyDetails;