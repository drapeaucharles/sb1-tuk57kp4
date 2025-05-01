import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import HostCalendar from '../../components/HostCalendar';
import { supabase } from '../../lib/supabase';

const ManageCalendar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleAvailabilityChange = async (dates: Array<{ date: string; price: number }>) => {
    if (!id) return;
    
    setIsSaving(true);
    try {
      // Sort dates to ensure consistent order
      const sortedDates = dates.sort((a, b) => a.date.localeCompare(b.date));
      
      const { error } = await supabase
        .from('properties')
        .update({
          available_dates: sortedDates
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state to reflect changes
      setProperty(prev => ({
        ...prev,
        available_dates: sortedDates
      }));
    } catch (err) {
      console.error('Error updating availability:', err);
      alert('Failed to update availability. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-800 rounded w-1/4 mb-8"></div>
          <div className="h-96 bg-gray-800 rounded"></div>
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

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Calendar</h1>
          <p className="text-gray-400 mt-1">{property.title}</p>
        </div>
        {isSaving && (
          <span className="text-sm text-gray-400">Saving changes...</span>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <HostCalendar
          availableDates={property.available_dates || []}
          onAvailabilityChange={handleAvailabilityChange}
        />
      </div>
    </div>
  );
};

export default ManageCalendar;