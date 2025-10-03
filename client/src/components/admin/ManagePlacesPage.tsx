import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, Save, X, MapPin, ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import ImageUpload from '@/components/ui/ImageUpload';
import { apiClient } from '@/lib/api';
import type { Place } from '@/lib/api';
import { toast } from 'sonner';

interface ManagePlacesPageProps {
  destinationId?: string;
}

// Google Maps configuration
const libraries: ("places")[] = ["places"];
const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultCenter = {
  lat: 7.8731,
  lng: 80.7718 // Sri Lanka center
};

const ManagePlacesPage: React.FC<ManagePlacesPageProps> = ({ destinationId }) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rating: 4.5,
    duration: '',
    timeDuration: '',
    highlights: '',
    images: [] as string[],
    location: { lat: defaultCenter.lat, lng: defaultCenter.lng },
    destinationId: destinationId || ''
  });

  // Map state
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);
  const [searchInput, setSearchInput] = useState('');
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Load places on mount and when destinationId changes
  useEffect(() => {
    loadPlaces();
  }, [destinationId]);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPlaces({
        destinationId: destinationId,
      });
      if (response.success && response.data) {
        setPlaces(response.data.places);
      }
    } catch (error) {
      console.error('Failed to load places:', error);
      toast.error('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (place?: Place) => {
    if (place) {
      setEditingPlace(place);
      setFormData({
        name: place.name,
        description: place.description,
        rating: place.rating,
        duration: place.duration,
        timeDuration: place.timeDuration || '',
        highlights: place.highlights ? place.highlights.join(', ') : '',
        images: place.images,
        location: place.location,
        destinationId: place.destinationId
      });
      setMarkerPosition(place.location);
      setMapCenter(place.location);
    } else {
      setEditingPlace(null);
      setFormData({
        name: '',
        description: '',
        rating: 4.5,
        duration: '',
        timeDuration: '',
        highlights: '',
        images: [],
        location: { lat: defaultCenter.lat, lng: defaultCenter.lng },
        destinationId: destinationId || ''
      });
      setMarkerPosition(defaultCenter);
      setMapCenter(defaultCenter);
    }
    setSearchInput('');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPlace(null);
  };

  const handleSave = async () => {
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    if (!formData.timeDuration.trim()) {
      toast.error('Please enter time duration');
      return;
    }

    if (!formData.highlights.trim()) {
      toast.error('Please enter at least one highlight');
      return;
    }

    try {
      setSubmitting(true);

      const placeData = {
        destinationId: formData.destinationId,
        name: formData.name,
        description: formData.description,
        rating: Number(formData.rating),
        duration: formData.duration,
        timeDuration: formData.timeDuration,
        highlights: formData.highlights.split(',').map(h => h.trim()).filter(Boolean),
        images: formData.images,
        location: formData.location,
      };

      if (editingPlace) {
        await apiClient.updatePlace(editingPlace.id, placeData);
        toast.success('Place updated successfully');
      } else {
        await apiClient.createPlace(placeData);
        toast.success('Place created successfully');
      }

      handleCloseDialog();
      loadPlaces();
    } catch (error) {
      console.error('Failed to save place:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save place');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this place?')) {
      return;
    }

    try {
      await apiClient.deletePlace(id);
      toast.success('Place deleted successfully');
      loadPlaces();
    } catch (error) {
      console.error('Failed to delete place:', error);
      toast.error('Failed to delete place');
    }
  };

  // Google Maps handlers
  const onLoadAutocomplete = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        setMarkerPosition(newLocation);
        setMapCenter(newLocation);
        setFormData(prev => ({ ...prev, location: newLocation }));
        setSearchInput(place.formatted_address || place.name || '');
      }
    }
  };

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setMarkerPosition(newLocation);
      setFormData(prev => ({ ...prev, location: newLocation }));
    }
  }, []);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      setMarkerPosition(newLocation);
      setFormData(prev => ({ ...prev, location: newLocation }));
    }
  }, []);

  const filteredPlaces = places.filter(place => {
    // Filter by destination if destinationId is provided
    const matchesDestination = destinationId ? place.destinationId === destinationId : true;
    
    // Filter by search query
    const matchesSearch = 
      place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDestination && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background relative p-6">
      {/* No pattern background for admin */}
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mb-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Back Button (shown when viewing specific destination) */}
          {destinationId && (
            <Link
              to="/admin/destinations"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Destinations
            </Link>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Manage Places
                {destinationId && <span className="text-muted-foreground text-2xl ml-2">for Destination</span>}
              </h1>
              <p className="text-muted-foreground">
                {destinationId 
                  ? `Managing places for destination ID: ${destinationId}`
                  : 'Add, edit, or remove places for all destinations'
                }
              </p>
            </div>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Place
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </motion.div>

      {/* Places Grid */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card border-border overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <img
                    src={place.images[0] || '/src/assets/category-heritage.jpg'}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-lg mb-1">{place.name}</h3>
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <span>⭐ {place.rating}</span>
                      <span>•</span>
                      <span>{place.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {place.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <MapPin className="w-3 h-3" />
                    <span>{place.location.lat.toFixed(4)}, {place.location.lng.toFixed(4)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(place)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(place.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredPlaces.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No places found</h3>
            <p className="text-muted-foreground">Try adjusting your search or add a new place.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPlace ? 'Edit Place' : 'Add New Place'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Place Name</label>
                <Input
                  placeholder="e.g., Sacred Temple"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description ({formData.description.length}/500)
                </label>
                <Textarea
                  placeholder="Describe the place..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 500 characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <Input
                    placeholder="e.g., 2 hours"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Time Duration</label>
                <Input
                  placeholder="e.g., 2-3 hours to fully explore"
                  value={formData.timeDuration}
                  onChange={(e) => setFormData({ ...formData, timeDuration: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended time needed to explore this place
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Key Highlights</label>
                <Textarea
                  placeholder="e.g., Ancient frescoes, Lion's Gate, Summit views"
                  value={formData.highlights}
                  onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter highlights separated by commas
                </p>
              </div>

              <div>
                <ImageUpload
                  value={formData.images}
                  onChange={(urls) => setFormData({ ...formData, images: urls })}
                  maxImages={3}
                  label="Place Images (Max 3)"
                  maxFileSize={5}
                />
              </div>
            </div>

            {/* Location Selection with Google Maps */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <p className="text-xs text-muted-foreground mb-3">
                  Click/drag the marker on the map or use the search below to set the exact position
                </p>
                
                {/* Google Maps */}
                <LoadScript
                  googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}
                  libraries={libraries}
                >
                  {/* Google Map */}
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={13}
                    onClick={onMapClick}
                  >
                    <Marker
                      position={markerPosition}
                      draggable={true}
                      onDragEnd={onMarkerDragEnd}
                    />
                  </GoogleMap>

                  {/* Google Maps Search - Below Map */}
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                  >
                    <div className="relative mt-4">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                      <input
                        type="text"
                        placeholder="Or search for a place in Sri Lanka..."
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                  </Autocomplete>
                </LoadScript>
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Latitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.location.lat}
                    onChange={(e) => {
                      const newLat = parseFloat(e.target.value);
                      const newLocation = { lat: newLat, lng: formData.location.lng };
                      setFormData({ ...formData, location: newLocation });
                      setMarkerPosition(newLocation);
                      setMapCenter(newLocation);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Longitude</label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.location.lng}
                    onChange={(e) => {
                      const newLng = parseFloat(e.target.value);
                      const newLocation = { lat: formData.location.lat, lng: newLng };
                      setFormData({ ...formData, location: newLocation });
                      setMarkerPosition(newLocation);
                      setMapCenter(newLocation);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={submitting}>
              <Save className="w-4 h-4 mr-2" />
              {submitting ? 'Saving...' : editingPlace ? 'Update Place' : 'Add Place'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagePlacesPage;
