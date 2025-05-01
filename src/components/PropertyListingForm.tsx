import React, { useState } from 'react';
import { Calendar, Upload, Ban, DollarSign, Trash, Bed } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import Card, { CardContent, CardHeader, CardFooter } from './ui/Card';
import { supabase } from '../lib/supabase';

interface PropertyFormData {
  name: string;
  description: string;
  location: string;
  propertyType: string;
  images: File[];
  basePrice: string;
  deposit: string;
  biddingCutoff: string;
  numBeds: string;
  numBedrooms: string;
  minNights: string;
}

interface PropertyListingFormProps {
  onSubmit: (data: PropertyFormData & { imageUrls: string[] }) => void;
  initialData?: {
    title: string;
    description: string;
    location: string;
    property_type: string;
    images: string[];
    minimum_bid_price: number;
    deposit: number;
    bidding_cutoff: number;
    num_beds: number;
    num_bedrooms: number;
    min_nights: number;
  };
  mode?: 'create' | 'edit';
}

const PropertyListingForm: React.FC<PropertyListingFormProps> = ({ 
  onSubmit, 
  initialData,
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState<PropertyFormData>({
    name: initialData?.title || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    propertyType: initialData?.property_type || 'apartment',
    images: [],
    basePrice: initialData?.minimum_bid_price?.toString() || '',
    deposit: initialData?.deposit?.toString() || '200',
    biddingCutoff: initialData?.bidding_cutoff?.toString() || '3',
    numBeds: initialData?.num_beds?.toString() || '',
    numBedrooms: initialData?.num_bedrooms?.toString() || '',
    minNights: initialData?.min_nights?.toString() || '1'
  });
  
  const [imageURLs, setImageURLs] = useState<string[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const propertyTypeOptions = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'villa', label: 'Villa' },
    { value: 'condo', label: 'Condo' },
    { value: 'cabin', label: 'Cabin' }
  ];
  
  const biddingCutoffOptions = [
    { value: '1', label: '1 day before check-in' },
    { value: '2', label: '2 days before check-in' },
    { value: '3', label: '3 days before check-in' },
    { value: '5', label: '5 days before check-in' },
    { value: '7', label: '7 days before check-in' },
    { value: '14', label: '14 days before check-in' }
  ];

  const minNightsOptions = [
    { value: '1', label: '1 night minimum' },
    { value: '2', label: '2 nights minimum' },
    { value: '3', label: '3 nights minimum' },
    { value: '4', label: '4 nights minimum' },
    { value: '5', label: '5 nights minimum' },
    { value: '7', label: '7 nights minimum' },
    { value: '14', label: '14 nights minimum' },
    { value: '30', label: '30 nights minimum' }
  ];
  
  const handleChange = (key: keyof PropertyFormData, value: string) => {
    setFormData({
      ...formData,
      [key]: value
    });
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsUploading(true);
      setUploadError(null);
      
      try {
        const files = Array.from(e.target.files);
        const uploadedUrls: string[] = [];
        
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${fileName}`;
          
          const { data, error } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);
            
          if (error) throw error;
          
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);
            
          uploadedUrls.push(publicUrl);
        }
        
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...files]
        }));
        
        setImageURLs(prev => [...prev, ...uploadedUrls]);
      } catch (error) {
        console.error('Error uploading images:', error);
        setUploadError('Failed to upload images. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const handleRemoveImage = async (index: number) => {
    try {
      // Extract filename from URL
      const url = imageURLs[index];
      const fileName = url.split('/').pop();
      
      if (fileName) {
        await supabase.storage
          .from('property-images')
          .remove([fileName]);
      }
      
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      
      const newImageURLs = [...imageURLs];
      newImageURLs.splice(index, 1);
      
      setFormData({
        ...formData,
        images: newImages
      });
      
      setImageURLs(newImageURLs);
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, imageUrls: imageURLs });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Basic Information</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Property Name"
                placeholder="Enter a catchy title for your property"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                fullWidth
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                className="bg-gray-900 border border-gray-700 rounded-lg w-full p-2.5 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                rows={4}
                placeholder="Describe your property, amenities, etc."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                required
              />
            </div>
            
            <Input
              label="Location"
              placeholder="City, State, Country"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
              fullWidth
            />
            
            <Select
              label="Property Type"
              options={propertyTypeOptions}
              value={formData.propertyType}
              onChange={(value) => handleChange('propertyType', value)}
              required
              fullWidth
            />

            <div className="flex space-x-4">
              <Input
                label="Number of Beds"
                type="number"
                min="1"
                placeholder="2"
                value={formData.numBeds}
                onChange={(e) => handleChange('numBeds', e.target.value)}
                leftIcon={<Bed size={18} />}
                required
                fullWidth
              />
              
              <Input
                label="Number of Bedrooms"
                type="number"
                min="1"
                placeholder="1"
                value={formData.numBedrooms}
                onChange={(e) => handleChange('numBedrooms', e.target.value)}
                leftIcon={<Bed size={18} />}
                required
                fullWidth
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Property Images</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-400">
                {mode === 'edit' ? 'Add more photos to your listing' : 'Upload photos of your property'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG or WEBP, max 5MB each
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Select Files'}
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isUploading}
              />
            </div>
            
            {uploadError && (
              <div className="text-rose-500 text-sm text-center">
                {uploadError}
              </div>
            )}
            
            {imageURLs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {imageURLs.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Property image ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-white">Pricing & Availability</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Base Price Per Night (USDT)"
              type="number"
              min="1"
              step="0.01"
              placeholder="50.00"
              value={formData.basePrice}
              onChange={(e) => handleChange('basePrice', e.target.value)}
              leftIcon={<DollarSign size={18} />}
              required
              fullWidth
            />
            
            <Input
              label="Security Deposit (USDT)"
              type="number"
              min="0"
              step="0.01"
              placeholder="200.00"
              value={formData.deposit}
              onChange={(e) => handleChange('deposit', e.target.value)}
              leftIcon={<DollarSign size={18} />}
              required
              fullWidth
            />
            <div className="text-sm text-gray-400 md:col-start-2">
              This deposit will be held and refunded to the guest 3 days after check-out.
            </div>
            
            <Select
              label="Bidding Cutoff"
              options={biddingCutoffOptions}
              value={formData.biddingCutoff}
              onChange={(value) => handleChange('biddingCutoff', value)}
              required
              fullWidth
            />

            <Select
              label="Minimum Stay"
              options={minNightsOptions}
              value={formData.minNights}
              onChange={(value) => handleChange('minNights', value)}
              required
              fullWidth
            />
            <div className="text-sm text-gray-400 md:col-start-2">
              Guests must book at least this many consecutive nights.
            </div>
            
            <div className="md:col-span-2 mt-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Calendar size={20} className="text-indigo-400" />
                <h3 className="text-lg font-medium">Set Available Dates</h3>
              </div>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                After creating your listing, you'll be able to set specific dates and custom pricing.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg" disabled={isUploading}>
              {mode === 'edit' ? 'Save Changes' : 'Create Listing'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
};

export default PropertyListingForm;