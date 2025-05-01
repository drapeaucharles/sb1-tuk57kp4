import React, { useState, useEffect } from 'react';
import { Search, Building, Clock, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import PropertyCard from '../components/PropertyCard';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

const HomePage: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .limit(4)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFeaturedProperties(data || []);
      } catch (err) {
        console.error('Error fetching featured properties:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedProperties();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-900/70 z-[1]" />
        <div 
          className="relative h-[600px] bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')"
          }}
        >
          <div className="container mx-auto px-4 h-full flex items-center relative z-[2]">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Bid on your next stay
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-8">
                Name your price, secure your dream rental. A better way to book with blockchain security.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/browse">
                  <Button variant="primary" size="lg">
                    Browse Listings
                  </Button>
                </Link>
                <Link to="/host">
                  <Button variant="outline" size="lg">
                    List Your Property
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Search */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg -mt-16 relative z-30">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Search</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Where are you going?" 
                  className="bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 w-full text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  placeholder="Check in" 
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 w-full text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
                <input 
                  type="date" 
                  placeholder="Check out" 
                  className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 w-full text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
              <Link to="/browse" className="w-full">
                <Button variant="primary" fullWidth>
                  Search
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Listings */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Featured Listings</h2>
            <Link to="/browse" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-800 rounded-xl h-64 mb-4"></div>
                  <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map(property => (
                <PropertyCard
                  key={property.id}
                  id={property.id}
                  title={property.title}
                  location={property.location || ''}
                  minPrice={property.minimum_bid_price}
                  currentBid={null}
                  deposit={property.deposit || 0}
                  image={(property.images as string[])?.[0] || ''}
                  rating={4.8}
                  bids={property.active_bids}
                  daysLeft={3}
                  isLeading={false}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our blockchain-based platform ensures transparency and security while giving you the power to name your price.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Find Your Perfect Rental</h3>
              <p className="text-gray-400">
                Browse thousands of properties with transparent pricing and availability. Filter by location, dates, and more.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Place Your Bids</h3>
              <p className="text-gray-400">
                Bid what you're willing to pay for each night. No upfront payment until your bid wins. Place bids on multiple properties.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Secure Your Stay</h3>
              <p className="text-gray-400">
                When bidding closes, the highest bidder wins. Smart contracts ensure your payment is secure and refundable if outbid.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust & Security */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold text-white mb-4">Powered by Blockchain Security</h2>
              <p className="text-gray-400 mb-6">
                Our platform leverages smart contracts on the blockchain to ensure your funds are secure. Only highest bidders have funds frozen, and they're instantly released if outbid.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-emerald-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Transparent Transactions</h3>
                    <p className="text-gray-400 text-sm">Every bid and payment is recorded on the blockchain for complete transparency.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-emerald-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Instant Refunds</h3>
                    <p className="text-gray-400 text-sm">Smart contracts automatically release your funds the moment you're outbid.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-emerald-400 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white">Secure USDT Payments</h3>
                    <p className="text-gray-400 text-sm">All transactions use USDT stablecoin to protect against cryptocurrency volatility.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.pexels.com/photos/3601426/pexels-photo-3601426.jpeg" 
                alt="Luxury beachfront villa" 
                className="rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to start bidding on your dream stays?</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have already saved on their accommodations with our unique bidding system.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/browse">
              <Button variant="primary" size="lg" className="bg-white text-indigo-700 hover:bg-gray-100">
                Start Browsing
              </Button>
            </Link>
            <Link to="/host">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-indigo-800">
                Become a Host
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;