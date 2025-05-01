import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PropertyListingForm from '../../components/PropertyListingForm';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProperty() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (err) {
        console.error('Error fetching property:', err);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({
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
          images: data.imageUrls
        })
        .eq('id', id);

      if (error) throw error;

      alert('Property updated successfully!');
      navigate('/host');
    } catch (err) {
      console.error('Error updating property:', err);
      alert('Failed to update property. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="space-y-6">
            <div className="h-40 bg-gray-800 rounded"></div>
            <div className="h-40 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-rose-900/20 border border-rose-800 rounded-xl p-6 text-center">
          <p className="text-rose-200 mb-4">{error || 'Property not found'}</p>
          <Button variant="primary" onClick={() => navigate('/host')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/host')}
        leftIcon={<ArrowLeft size={16} />}
      >
        Back to Dashboard
      </Button>

      <h1 className="text-2xl font-bold text-white mb-6">Edit Property</h1>
      <PropertyListingForm 
        onSubmit={handleSubmit} 
        initialData={property}
        mode="edit"
      />
    </div>
  );
};

export default EditListing;