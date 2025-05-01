import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import BidHistoryItem from '../components/BidHistoryItem';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

type BidFilter = 'all' | 'active' | 'won' | 'past';

interface Bid {
  id: string;
  property_id: string;
  total_amount: number;
  deposit_amount: number;
  status: 'pending' | 'won' | 'lost' | 'outbid';
  created_at: string;
  nights: Array<{ date: string; bid_price: number }>;
  property: {
    title: string;
    location: string;
    images: string[];
  };
}

const MyBids: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<BidFilter>('all');
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuthStore();
  
  useEffect(() => {
    if (!userId) return;
    fetchBids();
  }, [userId]);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('bids')
        .select(`
          *,
          property:properties (
            title,
            location,
            images
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBids(data || []);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError('Failed to load your bids');
    } finally {
      setLoading(false);
    }
  };
  
  const filterBids = (filter: BidFilter) => {
    setActiveFilter(filter);
  };

  const getFilteredBids = () => {
    switch (activeFilter) {
      case 'active':
        return bids.filter(bid => ['pending'].includes(bid.status));
      case 'won':
        return bids.filter(bid => bid.status === 'won');
      case 'past':
        return bids.filter(bid => ['won', 'lost', 'outbid'].includes(bid.status));
      default:
        return bids;
    }
  };

  const filteredBids = getFilteredBids();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-white mb-8">My Bids</h1>
        
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={activeFilter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => filterBids('all')}
          >
            All Bids
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => filterBids('active')}
          >
            Active Bids
          </Button>
          <Button
            variant={activeFilter === 'won' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => filterBids('won')}
          >
            Won Bids
          </Button>
          <Button
            variant={activeFilter === 'past' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => filterBids('past')}
          >
            Past Bids
          </Button>
        </div>
        
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-800 h-48 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-900/20 border border-rose-800 rounded-xl p-6 text-center">
            <p className="text-rose-200 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchBids}>
              Try Again
            </Button>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="bg-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-400 mb-4">No bids found in this category.</p>
            <Button variant="primary" onClick={() => window.location.href = '/browse'}>
              Browse Rentals
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBids.map(bid => {
              const checkInDate = new Date(bid.nights[0].date);
              const checkOutDate = new Date(bid.nights[bid.nights.length - 1].date);
              checkOutDate.setDate(checkOutDate.getDate() + 1); // Add one day for checkout

              return (
                <BidHistoryItem
                  key={bid.id}
                  id={bid.id}
                  propertyName={bid.property.title}
                  propertyImage={(bid.property.images as string[])[0]}
                  location={bid.property.location}
                  dates={{
                    checkIn: checkInDate.toISOString(),
                    checkOut: checkOutDate.toISOString()
                  }}
                  totalBid={bid.total_amount}
                  depositAmount={bid.deposit_amount}
                  status={bid.status as any}
                />
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyBids;