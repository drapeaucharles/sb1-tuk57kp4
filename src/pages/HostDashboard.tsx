import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Table as Tabs, Building, Calendar as CalendarIcon, DollarSign, Settings } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import PropertyListingForm from '../components/PropertyListingForm';
import ManageCalendar from './host/ManageCalendar';
import ViewBids from './host/ViewBids';
import EditListing from './host/EditListing';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

type TabType = 'listings' | 'calendar' | 'earnings' | 'settings' | 'create';

interface DashboardStats {
  activeProperties: number;
  totalEarnings: number;
  upcomingPayouts: number;
  activeBids: number;
}

interface Property {
  id: string;
  title: string;
  location: string;
  description: string;
  minimum_bid_price: number;
  images: string[];
  active_bids: number;
  total_earnings: number;
}

const HostDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeProperties: 0,
    totalEarnings: 0,
    upcomingPayouts: 0,
    activeBids: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userId } = useAuthStore();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        if (!userId) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Fetch properties with their stats
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            location,
            description,
            minimum_bid_price,
            images,
            active_bids,
            total_earnings
          `)
          .eq('user_id', userId);

        if (propertiesError) throw propertiesError;

        // Fetch upcoming payouts from pending bookings
        const { data: upcomingPayouts, error: payoutsError } = await supabase
          .from('bookings')
          .select('total_paid_amount')
          .eq('host_id', userId)
          .eq('payout_status', 'pending')
          .eq('booking_status', 'confirmed');

        if (payoutsError) throw payoutsError;

        // Calculate dashboard stats
        const totalEarnings = propertiesData.reduce((sum, p) => sum + (p.total_earnings || 0), 0);
        const activeBids = propertiesData.reduce((sum, p) => sum + (p.active_bids || 0), 0);
        const pendingPayouts = upcomingPayouts.reduce((sum, b) => sum + (b.total_paid_amount || 0), 0);

        setProperties(propertiesData);
        setStats({
          activeProperties: propertiesData.length,
          totalEarnings,
          upcomingPayouts: pendingPayouts,
          activeBids
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [userId]);

  const handleCreatePropertySubmit = async (data: any) => {
    try {
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('properties')
        .insert([{
          user_id: userId,
          title: data.name,
          description: data.description,
          location: data.location,
          property_type: data.propertyType,
          minimum_bid_price: parseFloat(data.basePrice),
          deposit: parseFloat(data.deposit),
          bidding_cutoff: parseInt(data.biddingCutoff),
          num_beds: parseInt(data.numBeds),
          num_bedrooms: parseInt(data.numBedrooms),
          min_nights: parseInt(data.minNights),
          images: data.imageUrls,
          active_bids: 0,
          total_earnings: 0
        }]);

      if (error) throw error;

      alert('Property created successfully!');
      setActiveTab('listings');
      
      // Refresh dashboard data
      const { data: newData, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;
      setProperties(newData);
    } catch (err) {
      console.error('Error creating property:', err);
      alert('Failed to create property. Please try again.');
    }
  };

  const handleEditClick = (propertyId: string) => {
    navigate(`/host/property/${propertyId}/edit`);
  };

  const handleCalendarClick = (propertyId: string) => {
    navigate(`/host/property/${propertyId}/calendar`);
  };

  const handleBidsClick = (propertyId: string) => {
    navigate(`/host/property/${propertyId}/bids`);
  };

  return (
    <Layout>
      <Routes>
        <Route path="property/:id/edit" element={<EditListing />} />
        <Route path="property/:id/calendar" element={<ManageCalendar />} />
        <Route path="property/:id/bids" element={<ViewBids />} />
        <Route
          path="*"
          element={
            <div className="container mx-auto px-4 py-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-white">Host Dashboard</h1>
                  <p className="text-gray-400 mt-1">Manage your properties and track your earnings</p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={() => setActiveTab('create')}
                  className="mt-4 md:mt-0"
                >
                  + Add New Property
                </Button>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Active Properties</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.activeProperties}</p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-900/50 rounded-full flex items-center justify-center">
                        <Building className="h-6 w-6 text-indigo-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Total Earnings</p>
                        <p className="text-3xl font-bold text-white mt-1">${stats.totalEarnings.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-900/50 rounded-full flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">Upcoming Payouts</p>
                        <p className="text-3xl font-bold text-white mt-1">${stats.upcomingPayouts.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-900/50 rounded-full flex items-center justify-center">
                        <CalendarIcon className="h-6 w-6 text-amber-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-gray-700 mb-8">
                <div className="flex overflow-x-auto">
                  <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTab === 'listings' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('listings')}
                  >
                    My Listings
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTab === 'calendar' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('calendar')}
                  >
                    Calendar
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTab === 'earnings' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('earnings')}
                  >
                    Earnings
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 ${
                      activeTab === 'settings' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </button>
                </div>
              </div>
              
              {/* Tab Content */}
              <div>
                {activeTab === 'listings' && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-6">My Properties</h2>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <p className="text-gray-400">Loading your properties...</p>
                      </div>
                    ) : error ? (
                      <div className="bg-rose-900/20 border border-rose-800 rounded-xl p-4 text-center">
                        <p className="text-rose-200">{error}</p>
                      </div>
                    ) : properties.length === 0 ? (
                      <div className="bg-gray-800 rounded-xl p-12 text-center">
                        <p className="text-gray-400 mb-4">You haven't listed any properties yet.</p>
                        <Button variant="primary" onClick={() => setActiveTab('create')}>
                          Add Your First Property
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {properties.map(property => (
                          <Card key={property.id} className="overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              <div className="md:w-1/4">
                                <img 
                                  src={property.images?.[0] || 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg'} 
                                  alt={property.title} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    img.src = 'https://images.pexels.com/photos/1396132/pexels-photo-1396132.jpeg';
                                  }}
                                />
                              </div>
                              <div className="p-6 flex-grow">
                                <div className="flex flex-col md:flex-row md:justify-between">
                                  <div>
                                    <h3 className="text-lg font-medium text-white">{property.title}</h3>
                                    <p className="text-gray-400 text-sm">{property.location}</p>
                                    
                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                      <div>
                                        <p className="text-xs text-gray-400">Min Price</p>
                                        <p className="font-medium text-white">${property.minimum_bid_price}/night</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-400">Active Bids</p>
                                        <p className="font-medium text-white">{property.active_bids}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-400">Total Earnings</p>
                                        <p className="font-medium text-emerald-400">${property.total_earnings}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-6 md:mt-0 flex flex-col space-y-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditClick(property.id)}
                                    >
                                      Edit Listing
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCalendarClick(property.id)}
                                    >
                                      Manage Calendar
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleBidsClick(property.id)}
                                    >
                                      View Bids ({property.active_bids})
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'create' && (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-6">Add New Property</h2>
                    <PropertyListingForm onSubmit={handleCreatePropertySubmit} />
                  </div>
                )}
                
                {activeTab === 'calendar' && (
                  <div className="bg-gray-800 rounded-xl p-8 text-center">
                    <CalendarIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <h2 className="text-xl font-medium text-white mb-2">Calendar View</h2>
                    <p className="text-gray-400 mb-6">
                      Select a property from your listings to manage its availability and pricing.
                    </p>
                    <Button variant="primary" onClick={() => setActiveTab('listings')}>
                      View My Properties
                    </Button>
                  </div>
                )}
                
                {activeTab === 'earnings' && (
                  <div className="bg-gray-800 rounded-xl p-8 text-center">
                    <DollarSign className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <h2 className="text-xl font-medium text-white mb-2">Earnings Dashboard</h2>
                    <p className="text-gray-400 mb-6">
                      Track your earnings, view payment history, and manage payouts.
                    </p>
                    <p className="text-gray-400">Coming soon!</p>
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <div className="bg-gray-800 rounded-xl p-8 text-center">
                    <Settings className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <h2 className="text-xl font-medium text-white mb-2">Account Settings</h2>
                    <p className="text-gray-400 mb-6">
                      Manage your profile, notification preferences, and payout methods.
                    </p>
                    <p className="text-gray-400">Coming soon!</p>
                  </div>
                )}
              </div>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
};

export default HostDashboard;