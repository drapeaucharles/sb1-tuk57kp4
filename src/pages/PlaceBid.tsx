import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Calculator, Wallet, ArrowLeft, AlertCircle, Shield, CreditCard } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card, { CardContent, CardFooter } from '../components/ui/Card';
import BidCalendar from '../components/BidCalendar';
import LoginModal from '../components/auth/LoginModal';
import { useAuthStore } from '../store/authStore';

// Sample property data
const property = {
  id: '1',
  title: 'Luxury Beach Villa',
  location: 'Malibu, California',
  image: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  minPrice: 120,
  currentBid: 145,
  deposit: 200,
  bidCutoff: 3,
  availableDates: [
    { date: '2025-07-01', minPrice: 120 },
    { date: '2025-07-02', minPrice: 120 },
    { date: '2025-07-03', minPrice: 120 },
    { date: '2025-07-04', minPrice: 140 },
    { date: '2025-07-05', minPrice: 140 },
    { date: '2025-07-06', minPrice: 120 },
    { date: '2025-07-07', minPrice: 110 },
    { date: '2025-07-08', minPrice: 110 },
    { date: '2025-07-09', minPrice: 110 },
    { date: '2025-07-10', minPrice: 110 },
    { date: '2025-07-11', minPrice: 130 },
    { date: '2025-07-12', minPrice: 130 },
    { date: '2025-07-13', minPrice: 120 },
    { date: '2025-07-14', minPrice: 120 },
    { date: '2025-07-15', minPrice: 120 },
  ]
};

interface Bid {
  date: string;
  amount: number;
}

const PlaceBid: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { userRole, paymentMethod, setPaymentMethod } = useAuthStore();
  
  // Calculate total bid amount including deposit
  const totalBidAmount = bids.reduce((sum, bid) => sum + bid.amount, 0);
  const totalWithDeposit = totalBidAmount + property.deposit;
  
  // Handle bid changes from the calendar
  const handleBidChange = (newBids: Bid[]) => {
    setBids(newBids);
  };
  
  // Submit bid handler
  const handleSubmitBid = () => {
    if (!userRole) {
      setIsLoginModalOpen(true);
      return;
    }

    alert(`Submitting bid for ${bids.length} nights. Total with deposit: $${totalWithDeposit.toFixed(2)} USDT via ${paymentMethod}`);
    // In a real app, this would interact with the blockchain or payment processor
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to={`/property/${id}`} 
            className="flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to property</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold text-white mb-6">Place a Bid</h1>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />
                  <div>
                    <h2 className="font-medium text-white">{property.title}</h2>
                    <div className="flex items-center text-gray-400 text-sm mt-1">
                      <MapPin size={14} className="mr-1" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Calendar size={20} className="text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Select Your Dates</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Select the nights you want to stay, then enter your maximum bid for each night. 
                        Your bid must be at least the minimum price.
                      </p>
                    </div>
                  </div>
                </div>
                
                <BidCalendar 
                  availableDates={property.availableDates}
                  onBidChange={handleBidChange}
                />

                {bids.length > 0 && (
                  <div className="mt-6 border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-medium text-white mb-4">Choose Payment Method</h3>
                    <div className="space-y-3">
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
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right column */}
          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Your Bid Summary</h2>
                
                {bids.length === 0 ? (
                  <div className="bg-gray-900 rounded-lg p-4 mb-6 text-center">
                    <Calendar size={24} className="text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400">
                      Select dates and place bids to see your summary
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-6">
                      {bids.map((bid, index) => {
                        const date = new Date(bid.date);
                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-300">
                              {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <span className="font-medium text-white">${bid.amount} USDT</span>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4 mb-6">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Nights</span>
                        <span className="font-medium text-white">{bids.length}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Total bids</span>
                        <span className="font-medium text-white">${totalBidAmount.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Security deposit</span>
                        <span className="font-medium text-white">${property.deposit.toFixed(2)} USDT</span>
                      </div>
                      <div className="flex justify-between text-lg mt-4 pt-4 border-t border-gray-700">
                        <span className="font-medium text-white">Total USDT to lock</span>
                        <span className="font-bold text-emerald-400">${totalWithDeposit.toFixed(2)} USDT</span>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-900/30 border border-indigo-800 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <Shield size={20} className="text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-indigo-200">Security Deposit Required</p>
                          <p className="text-indigo-300/80 mt-1">
                            This property requires a refundable deposit of {property.deposit} USDT.
                            {paymentMethod === 'crypto' 
                              ? "The deposit will be refunded to your wallet 3 days after check-out."
                              : "The deposit will be refunded to your site balance 3 days after check-out."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        {paymentMethod === 'crypto' ? (
                          <Wallet size={20} className="text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                        ) : (
                          <CreditCard size={20} className="text-indigo-400 mr-3 mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm text-gray-300">
                          {paymentMethod === 'crypto'
                            ? "Payment will be made via Crypto Wallet. Refunds and deposit returns will be sent directly to your wallet."
                            : "Payment will be made via Card. Refunds and deposit returns will be credited to your platform balance."}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                
                <Button 
                  variant="primary" 
                  fullWidth
                  disabled={bids.length === 0}
                  onClick={handleSubmitBid}
                >
                  {userRole ? (
                    bids.length > 0 ? `Place Bid ($${totalWithDeposit.toFixed(2)} total)` : 'Select dates to bid'
                  ) : (
                    'Login to Place Bid'
                  )}
                </Button>
                
                {bids.length > 0 && userRole && (
                  <p className="text-center text-xs text-gray-500 mt-4">
                    By placing a bid, you agree to the Terms of Service.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </Layout>
  );
};

export default PlaceBid;