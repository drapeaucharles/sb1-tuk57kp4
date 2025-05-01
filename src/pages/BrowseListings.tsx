import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import PropertyFilters from '../components/PropertyFilters';
import PropertyCard from '../components/PropertyCard';
import BidCalendar from '../components/BidCalendar';
import Button from '../components/ui/Button';
import { Bed, Bath, Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

const BrowseListings: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedDates, setSelectedDates] = useState<Array<{ date: string; amount: number }>>([]);
  const [isBidding, setIsBidding] = useState(false);
  
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (filters?: any) => {
    try {
      setLoading(true);
      let query = supabase.from('properties').select('*');

      if (filters) {
        if (filters.location) {
          query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.minPrice) {
          query = query.gte('minimum_bid_price', parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
          query = query.lte('minimum_bid_price', parseFloat(filters.maxPrice));
        }
        if (filters.propertyType) {
          query = query.eq('property_type', filters.propertyType);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setProperties(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilter = (filters: any) => {
    fetchProperties(filters);
  };

  const handlePlaceBid = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setSelectedDates([]);
      setIsBidding(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBidChange = (bids: Array<{ date: string; amount: number }>) => {
    setSelectedDates(bids);
  };

  const handleConfirmBid = () => {
    // Handle bid confirmation logic here
    console.log('Confirming bid:', { property: selectedProperty?.id, dates: selectedDates });
    setSelectedProperty(null);
    setSelectedDates([]);
    setIsBidding(false);
  };
  
  return (
    <Layout>
      {/* Browse Header - Only show when no property is selected */}
      {!selectedProperty && (
        <section className="bg-gray-900 pt-8 pb-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-white mb-6">Browse Rentals</h1>
            <PropertyFilters onFilter={handleFilter} />
          </div>
        </section>
      )}
      
      {/* Selected Property Details */}
      {selectedProperty && (
        <section className="py-8 bg-gray-900 border-b border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost"
                onClick={() => setSelectedProperty(null)}
                className="mr-4"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to listings
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Property Details */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {(selectedProperty.images as string[])?.slice(0, 4).map((image, index) => (
                    <img 
                      key={index}
                      src={image}
                      alt={`${selectedProperty.title} - ${index + 1}`}
                      className="w-full h-64 object-cover rounded-xl"
                    />
                  ))}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">{selectedProperty.title}</h2>
                <p className="text-gray-400 mb-4">{selectedProperty.location}</p>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-400 mb-1">
                      <Bed size={18} className="mr-2" />
                      <span>Beds</span>
                    </div>
                    <p className="text-xl font-semibold text-white">{selectedProperty.num_beds}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-400 mb-1">
                      <Bath size={18} className="mr-2" />
                      <span>Bedrooms</span>
                    </div>
                    <p className="text-xl font-semibold text-white">{selectedProperty.num_bedrooms}</p>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center text-gray-400 mb-1">
                      <Calendar size={18} className="mr-2" />
                      <span>Min Nights</span>
                    </div>
                    <p className="text-xl font-semibold text-white">{selectedProperty.min_nights}</p>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                  <p className="text-gray-300">{selectedProperty.description}</p>
                </div>

                {isBidding ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-white">Select Your Dates</h3>
                      <Button 
                        variant="ghost" 
                        onClick={() => setIsBidding(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    <BidCalendar 
                      availableDates={(selectedProperty.available_dates as any[]).map(d => ({
                        date: d.date,
                        minPrice: d.price
                      }))}
                      onBidChange={handleBidChange}
                    />
                  </div>
                ) : (
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => setIsBidding(true)}
                  >
                    Place Bid
                  </Button>
                )}
              </div>

              {/* Bid Summary */}
              {isBidding && (
                <div>
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Your Bid Summary</h3>
                    
                    {selectedDates.length === 0 ? (
                      <p className="text-gray-400">Select dates to place your bid</p>
                    ) : (
                      <>
                        <div className="space-y-2 mb-4">
                          {selectedDates.map((bid, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-300">
                                {new Date(bid.date).toLocaleDateString()}
                              </span>
                              <span className="font-medium text-white">
                                ${bid.amount} USDT
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-gray-700 pt-4">
                          <div className="flex justify-between text-lg">
                            <span className="font-medium text-white">Total</span>
                            <span className="font-bold text-emerald-400">
                              ${selectedDates.reduce((sum, bid) => sum + bid.amount, 0)} USDT
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="primary"
                          fullWidth
                          className="mt-6"
                          onClick={handleConfirmBid}
                        >
                          Confirm Bid
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      
      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="bg-rose-900/20 border border-rose-800 rounded-xl p-6 text-center">
              <p className="text-rose-200">{error}</p>
            </div>
          ) : !selectedProperty && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {loading ? 'Loading properties...' : `${properties.length} properties found`}
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Sort by:</span>
                  <select 
                    className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-sm text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option>Featured</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                    <option>Most Bids</option>
                    <option>Ending Soon</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-800 rounded-xl h-64 mb-4"></div>
                      <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No properties found matching your criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {properties.map(property => (
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
                      onPlaceBid={handlePlaceBid}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BrowseListings;